import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';

export const listStudents = async (req: Request, res: Response): Promise<void> => {
  const { search, roomId } = req.query;
  const students = await prisma.student.findMany({
    where: {
      ...(roomId && { roomId: parseInt(roomId as string) }),
      ...(search && {
        user: {
          OR: [
            { name:  { contains: search as string } },
            { email: { contains: search as string } },
          ],
        },
      }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      room: { select: { id: true, number: true, type: true } },
      payments: { orderBy: { dueDate: 'desc' }, take: 1 },
    },
    orderBy: { user: { name: 'asc' } },
  });
  res.json(students);
};

export const getStudent = async (req: Request, res: Response): Promise<void> => {
  const student = await prisma.student.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      user: true,
      room: true,
      payments: { orderBy: { createdAt: 'desc' } },
      meals: { where: { isActive: true } },
      cleanReqs: { orderBy: { createdAt: 'desc' }, take: 5 },
      sportIssues: { include: { equipment: true }, orderBy: { issuedAt: 'desc' }, take: 5 },
    },
  });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }
  res.json(student);
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, phone, course, year, joinDate, roomId } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already exists' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, name, phone, role: 'STUDENT',
        student: {
          create: { course, year, joinDate: new Date(joinDate), ...(roomId && { roomId }) },
        },
      },
      include: { student: true },
    });

    if (roomId) {
      await prisma.room.update({
        where: { id: roomId },
        data: { occupied: { increment: 1 } },
      });
    }
    const { passwordHash: _, ...safe } = user as any;
    res.status(201).json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to create student' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, course, year, roomId } = req.body;
  const studentId = parseInt(req.params.id);
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    // Handle room change
    if (roomId !== undefined && roomId !== student.roomId) {
      if (student.roomId) {
        await prisma.room.update({
          where: { id: student.roomId },
          data: { occupied: { decrement: 1 }, status: 'AVAILABLE' },
        });
      }
      if (roomId) {
        await prisma.room.update({
          where: { id: roomId },
          data: { occupied: { increment: 1 } },
        });
      }
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { course, year, ...(roomId !== undefined && { roomId }) },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { ...(name && { name }), ...(phone && { phone }) },
      });
    }
    res.json({ message: 'Student updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update student' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const student = await prisma.student.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { payments: { where: { status: { in: ['PENDING', 'OVERDUE'] } } } },
  });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }
  if (student.payments.length > 0) {
    res.status(400).json({ error: 'Settle pending payments before deleting' }); return;
  }
  if (student.roomId) {
    await prisma.room.update({
      where: { id: student.roomId },
      data: { occupied: { decrement: 1 }, status: 'AVAILABLE' },
    });
  }
  await prisma.user.delete({ where: { id: student.userId } });
  res.json({ message: 'Student deleted' });
};