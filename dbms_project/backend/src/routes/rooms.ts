import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const rooms = await prisma.room.findMany({ include: { students: { include: { user: true } } } });
  res.json(rooms);
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { number, type, floor, capacity, rent, amenities } = req.body;
    const room = await prisma.room.create({
      data: { number, type, floor, capacity, rent, amenities }
    });
    res.json(room);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { number, type, floor, capacity, rent, status, amenities } = req.body;
    const room = await prisma.room.update({
      where: { id: Number(req.params.id) },
      data: { number, type, floor, capacity, rent, status, amenities }
    });
    res.json(room);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;