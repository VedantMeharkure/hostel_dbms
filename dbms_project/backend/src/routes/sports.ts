import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const equipment = await prisma.sportsEquipment.findMany({
    include: { issues: { include: { student: { include: { user: true } } } } }
  });
  res.json(equipment);
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, total, condition } = req.body;
    const equipment = await prisma.sportsEquipment.create({
      data: { name, total, available: total, condition }
    });
    res.json(equipment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/issue', authenticate, async (req, res) => {
  try {
    const { equipmentId, studentId } = req.body;
    const [issue] = await prisma.$transaction([
      prisma.equipmentIssue.create({ data: { equipmentId, studentId } }),
      prisma.sportsEquipment.update({
        where: { id: equipmentId },
        data: { available: { decrement: 1 } }
      })
    ]);
    res.json(issue);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/return/:issueId', authenticate, async (req, res) => {
  try {
    const issue = await prisma.equipmentIssue.update({
      where: { id: Number(req.params.issueId) },
      data: { returnedAt: new Date() }
    });
    await prisma.sportsEquipment.update({
      where: { id: issue.equipmentId },
      data: { available: { increment: 1 } }
    });
    res.json(issue);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;