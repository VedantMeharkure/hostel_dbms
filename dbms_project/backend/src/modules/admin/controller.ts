import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalRooms,
      availableRooms,
      pendingPayments,
      overduePayments,
      paidRevenue,
      pendingCleaning,
      upcomingEvents,
      activeIssues,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.room.count(),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'OVERDUE' } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.cleaningRequest.count({ where: { status: 'PENDING' } }),
      prisma.event.count({ where: { status: 'UPCOMING' } }),
      prisma.equipmentIssue.count({ where: { returnedAt: null } }),
    ]);

    const roomsByType = await prisma.room.groupBy({
      by: ['type'],
      _sum: { capacity: true, occupied: true },
      _count: { type: true },
    });

    const recentPayments = await prisma.payment.findMany({
      where: { status: 'PAID' },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { paidDate: 'desc' },
      take: 5,
    });

    res.json({
      summary: {
        totalStudents,
        totalRooms,
        availableRooms,
        occupiedRooms: totalRooms - availableRooms,
        pendingPayments,
        overduePayments,
        totalRevenue: Number(paidRevenue._sum.amount ?? 0),
        pendingCleaning,
        upcomingEvents,
        activeIssues,
      },
      roomsByType,
      recentPayments,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const { role, search } = req.query;
  const users = await prisma.user.findMany({
    where: {
      ...(role && { role: role as any }),
      ...(search && {
        OR: [
          { name:  { contains: search as string } },
          { email: { contains: search as string } },
        ],
      }),
    },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, isActive: true, createdAt: true,
      student: { select: { id: true, course: true, room: { select: { number: true } } } },
      staff:   { select: { id: true, department: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, role, isActive } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name     !== undefined && { name }),
        ...(phone    !== undefined && { phone }),
        ...(role     !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    const { passwordHash: _, ...safe } = user as any;
    res.json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const updated = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data: { isActive: !user.isActive },
  });
  res.json({ isActive: updated.isActive });
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  const { module } = req.query;
  const logs = await prisma.auditLog.findMany({
    where: { ...(module && { module: module as string }) },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(logs);
};