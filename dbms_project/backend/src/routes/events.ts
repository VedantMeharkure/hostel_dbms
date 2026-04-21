import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const events = await prisma.event.findMany({ include: { rsvps: true } });
  res.json(events);
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, date, endDate, category, organizer } = req.body;
    const event = await prisma.event.create({
      data: { title, description, date: new Date(date), endDate: endDate ? new Date(endDate) : null, category, organizer }
    });
    res.json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;