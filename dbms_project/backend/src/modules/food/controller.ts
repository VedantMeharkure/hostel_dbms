import { Request, Response } from 'express';
import { prisma } from '../../config/database';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_MENU: Record<string, { breakfast: string; lunch: string; dinner: string }> = {
  Monday:    { breakfast: 'Idli & Sambar',      lunch: 'Dal Rice',      dinner: 'Roti & Sabzi' },
  Tuesday:   { breakfast: 'Poha & Tea',          lunch: 'Rajma Chawal',  dinner: 'Khichdi' },
  Wednesday: { breakfast: 'Upma & Coffee',       lunch: 'Chole Bhature', dinner: 'Fried Rice' },
  Thursday:  { breakfast: 'Paratha & Curd',      lunch: 'Paneer Curry',  dinner: 'Chapati & Dal' },
  Friday:    { breakfast: 'Bread & Omelette',    lunch: 'Biryani',       dinner: 'Dosa & Chutney' },
  Saturday:  { breakfast: 'Puri & Halwa',        lunch: 'Veg Pulao',     dinner: 'Pasta' },
  Sunday:    { breakfast: 'Pancakes & Juice',    lunch: 'Special Thali', dinner: 'Naan & Gravy' },
};

function getWeekStart(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getWeeklyMenu = async (req: Request, res: Response): Promise<void> => {
  const weekStart = req.query.weekStart ? new Date(req.query.weekStart as string) : getWeekStart();
  let menu = await prisma.weeklyMenu.findMany({ where: { weekStart }, orderBy: { day: 'asc' } });

  if (menu.length === 0) {
    menu = await prisma.$transaction(
      DAYS.map((day) => prisma.weeklyMenu.create({ data: { day, weekStart, ...DEFAULT_MENU[day] } })),
    );
  }
  res.json({ weekStart, menu });
};

export const updateMenuDay = async (req: Request, res: Response): Promise<void> => {
  const { day } = req.params;
  const { breakfast, lunch, dinner, weekStart } = req.body;
  const startDate = weekStart ? new Date(weekStart) : getWeekStart();
  try {
    const menu = await prisma.weeklyMenu.upsert({
      where: { day_weekStart: { day, weekStart: startDate } },
      update: { breakfast, lunch, dinner },
      create: { day, weekStart: startDate, breakfast, lunch, dinner },
    });
    res.json(menu);
  } catch {
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

export const listSubscriptions = async (req: Request, res: Response): Promise<void> => {
  const { isPaid, plan } = req.query;
  const subs = await prisma.mealSubscription.findMany({
    where: {
      isActive: true,
      ...(isPaid !== undefined && { isPaid: isPaid === 'true' }),
      ...(plan && { plan: plan as any }),
    },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { startDate: 'desc' },
  });
  res.json(subs);
};

export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  const { studentId, plan, startDate, endDate, amount } = req.body;
  try {
    const sub = await prisma.mealSubscription.create({
      data: {
        studentId, plan, amount,
        startDate: new Date(startDate),
        endDate:   endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(sub);
  } catch {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await prisma.mealSubscription.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(sub);
  } catch {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

export const markSubscriptionPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const sub = await prisma.mealSubscription.update({
      where: { id: parseInt(req.params.id) },
      data: { isPaid: true },
    });
    res.json(sub);
  } catch {
    res.status(500).json({ error: 'Failed to mark as paid' });
  }
};