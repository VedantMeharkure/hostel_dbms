import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const listPayments = async (req: Request, res: Response): Promise<void> => {
  const { status, studentId, type } = req.query;
  const payments = await prisma.payment.findMany({
    where: {
      ...(status    && { status:    status    as any }),
      ...(studentId && { studentId: parseInt(studentId as string) }),
      ...(type      && { type:      type      as any }),
    },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      room: { select: { number: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  res.json(payments);
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { student: { include: { user: true, room: true } } },
  });
  if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }
  res.json(payment);
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const { studentId, roomId, amount, type, dueDate, notes } = req.body;
  try {
    const payment = await prisma.payment.create({
      data: { studentId, roomId, amount, type, dueDate: new Date(dueDate), notes },
    });
    res.status(201).json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

export const markPaid = async (req: Request, res: Response): Promise<void> => {
  const { paymentMethod = 'CASH' } = req.body;
  try {
    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'PAID', paidDate: new Date(), paymentMethod },
    });
    res.json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to mark payment as paid' });
  }
};

export const checkOverdue = async (_req: Request, res: Response): Promise<void> => {
  const result = await prisma.payment.updateMany({
    where: { status: 'PENDING', dueDate: { lt: new Date() } },
    data: { status: 'OVERDUE' },
  });
  res.json({ updated: result.count });
};