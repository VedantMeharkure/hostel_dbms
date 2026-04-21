import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const requests = await prisma.cleaningRequest.findMany({
    include: { student: { include: { user: true } }, assignedTo: { include: { user: true } } }
  });
  res.json(requests);
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { studentId, roomNumber, type, priority, scheduledAt, notes } = req.body;
    const request = await prisma.cleaningRequest.create({
      data: { studentId, roomNumber, type, priority, scheduledAt: scheduledAt ? new Date(scheduledAt) : null, notes }
    });
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, assignedToId, completedAt, feedback } = req.body;
    const request = await prisma.cleaningRequest.update({
      where: { id: Number(req.params.id) },
      data: { status, assignedToId, completedAt: completedAt ? new Date(completedAt) : null, feedback }
    });
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;