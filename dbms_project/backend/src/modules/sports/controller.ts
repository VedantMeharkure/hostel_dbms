import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const listEquipment = async (_req: Request, res: Response): Promise<void> => {
  const equipment = await prisma.sportsEquipment.findMany({
    include: {
      issues: {
        where: { returnedAt: null },
        include: { student: { include: { user: { select: { name: true } } } } },
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json(equipment);
};

export const getEquipment = async (req: Request, res: Response): Promise<void> => {
  const equipment = await prisma.sportsEquipment.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      issues: {
        include: { student: { include: { user: true } } },
        orderBy: { issuedAt: 'desc' },
      },
    },
  });
  if (!equipment) { res.status(404).json({ error: 'Equipment not found' }); return; }
  res.json(equipment);
};

export const addEquipment = async (req: Request, res: Response): Promise<void> => {
  const { name, total, available, condition } = req.body;
  try {
    const equipment = await prisma.sportsEquipment.create({
      data: { name, total, available: available ?? total, condition: condition ?? 'GOOD' },
    });
    res.status(201).json(equipment);
  } catch {
    res.status(500).json({ error: 'Failed to add equipment' });
  }
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const equipment = await prisma.sportsEquipment.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(equipment);
  } catch {
    res.status(500).json({ error: 'Failed to update' });
  }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
  const equipment = await prisma.sportsEquipment.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { issues: { where: { returnedAt: null } } },
  });
  if (!equipment) { res.status(404).json({ error: 'Equipment not found' }); return; }
  if (equipment.issues.length > 0) {
    res.status(400).json({ error: 'Equipment currently issued out' }); return;
  }
  await prisma.sportsEquipment.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Equipment deleted' });
};

export const issueEquipment = async (req: Request, res: Response): Promise<void> => {
  const equipmentId = parseInt(req.params.id);
  const { studentId, notes } = req.body;
  try {
    const equipment = await prisma.sportsEquipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) { res.status(404).json({ error: 'Equipment not found' }); return; }
    if (equipment.available <= 0) { res.status(400).json({ error: 'No units available' }); return; }

    const [issue] = await prisma.$transaction([
      prisma.equipmentIssue.create({ data: { equipmentId, studentId, notes } }),
      prisma.sportsEquipment.update({ where: { id: equipmentId }, data: { available: { decrement: 1 } } }),
    ]);
    res.status(201).json(issue);
  } catch {
    res.status(500).json({ error: 'Failed to issue equipment' });
  }
};

export const returnEquipment = async (req: Request, res: Response): Promise<void> => {
  const equipmentId = parseInt(req.params.id);
  const { issueId } = req.body;
  try {
    const issue = await prisma.equipmentIssue.findUnique({ where: { id: issueId } });
    if (!issue) { res.status(404).json({ error: 'Issue record not found' }); return; }
    if (issue.returnedAt) { res.status(400).json({ error: 'Already returned' }); return; }

    const [updated] = await prisma.$transaction([
      prisma.equipmentIssue.update({ where: { id: issueId }, data: { returnedAt: new Date() } }),
      prisma.sportsEquipment.update({ where: { id: equipmentId }, data: { available: { increment: 1 } } }),
    ]);
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to process return' });
  }
};

export const listIssues = async (_req: Request, res: Response): Promise<void> => {
  const issues = await prisma.equipmentIssue.findMany({
    include: {
      equipment: { select: { name: true } },
      student:   { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { issuedAt: 'desc' },
  });
  res.json(issues);
};