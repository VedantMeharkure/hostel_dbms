import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/menu', authenticate, async (req, res) => {
  const menu = await prisma.weeklyMenu.findMany();
  res.json(menu);
});

router.post('/menu', authenticate, async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner, weekStart } = req.body;
    const menu = await prisma.weeklyMenu.upsert({
      where: { day_weekStart: { day, weekStart: new Date(weekStart) } },
      update: { breakfast, lunch, dinner },
      create: { day, breakfast, lunch, dinner, weekStart: new Date(weekStart) }
    });
    res.json(menu);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/subscriptions', authenticate, async (req, res) => {
  const subs = await prisma.mealSubscription.findMany({
    include: { student: { include: { user: true } } }
  });
  res.json(subs);
});

router.post('/subscriptions', authenticate, async (req, res) => {
  try {
    const { studentId, plan, startDate, endDate, amount } = req.body;
    const sub = await prisma.mealSubscription.create({
      data: { studentId, plan, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, amount }
    });
    res.json(sub);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;