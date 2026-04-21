import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const students = await prisma.student.findMany({
    include: { user: true, room: true }
  });
  res.json(students);
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { email, password, name, phone, course, year, joinDate, roomId } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.user.create({
      data: {
        email, passwordHash, name, phone, role: 'STUDENT',
        student: { create: { course, year, joinDate: new Date(joinDate), roomId: roomId || null } }
      },
      include: { student: true }
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, phone, course, year, roomId } = req.body;
    const student = await prisma.student.update({
      where: { id: Number(req.params.id) },
      data: { course, year, roomId: roomId || null, user: { update: { name, phone } } },
      include: { user: true, room: true }
    });
    res.json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: Number(req.params.id) } });
    await prisma.user.delete({ where: { id: student!.userId } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;