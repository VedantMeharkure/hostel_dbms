import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: { student: { include: { user: true } }, room: true }
  });
  res.json(payments);
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { studentId, roomId, amount, type, dueDate, notes } = req.body;
    const payment = await prisma.payment.create({
      data: { studentId, roomId, amount, type, dueDate: new Date(dueDate), notes }
    });
    res.json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, paidDate, paymentMethod } = req.body;
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status, paidDate: paidDate ? new Date(paidDate) : null, paymentMethod }
    });
    res.json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;