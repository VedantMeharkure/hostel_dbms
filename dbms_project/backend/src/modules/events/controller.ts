import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

export const listEvents = async (req: Request, res: Response): Promise<void> => {
  const { category, status } = req.query;
  const events = await prisma.event.findMany({
    where: {
      ...(category && { category: category as any }),
      ...(status   && { status:   status   as any }),
    },
    include: { _count: { select: { rsvps: true } } },
    orderBy: { date: 'asc' },
  });
  res.json(events);
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { rsvps: { include: { user: { select: { name: true } } } } },
  });
  if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
  res.json(event);
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { title, description, date, endDate, category, organizer } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        title, description, organizer, category,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(event);
  } catch {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.date)    data.date    = new Date(data.date);
    if (data.endDate) data.endDate = new Date(data.endDate);
    const event = await prisma.event.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  await prisma.event.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Event deleted' });
};

export const rsvpEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { going } = req.body;
  const userId  = req.user!.id;
  const eventId = parseInt(req.params.id);
  try {
    const rsvp = await prisma.eventRSVP.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: { going },
      create: { eventId, userId, going },
    });
    res.json(rsvp);
  } catch {
    res.status(500).json({ error: 'Failed to RSVP' });
  }
};