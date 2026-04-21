import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../middleware/auth';

export const listRequests = async (req: Request, res: Response): Promise<void> => {
  const { status, priority } = req.query;
  const requests = await prisma.cleaningRequest.findMany({
    where: {
      ...(status   && { status:   status   as any }),
      ...(priority && { priority: priority as any }),
    },
    include: {
      student:    { include: { user: { select: { name: true } } } },
      assignedTo: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });
  res.json(requests);
};

export const getRequest = async (req: Request, res: Response): Promise<void> => {
  const request = await prisma.cleaningRequest.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      student:    { include: { user: true } },
      assignedTo: { include: { user: true } },
    },
  });
  if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
  res.json(request);
};

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { roomNumber, type, priority, notes, studentId: bodyStudentId } = req.body;
  try {
    let studentId = bodyStudentId;
    if (!studentId) {
      const student = await prisma.student.findFirst({ where: { userId: req.user!.id } });
      studentId = student?.id;
    }
    if (!studentId) { res.status(400).json({ error: 'Student not found' }); return; }

    const request = await prisma.cleaningRequest.create({
      data: { studentId, roomNumber, type, priority: priority ?? 'MEDIUM', notes },
    });
    res.status(201).json(request);
  } catch {
    res.status(500).json({ error: 'Failed to create request' });
  }
};

export const updateRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await prisma.cleaningRequest.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(request);
  } catch {
    res.status(500).json({ error: 'Failed to update' });
  }
};

export const assignRequest = async (req: Request, res: Response): Promise<void> => {
  const { staffId, scheduledAt } = req.body;
  try {
    const request = await prisma.cleaningRequest.update({
      where: { id: parseInt(req.params.id) },
      data: {
        assignedToId: staffId,
        status: 'IN_PROGRESS',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });
    res.json(request);
  } catch {
    res.status(500).json({ error: 'Failed to assign' });
  }
};

export const completeRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await prisma.cleaningRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    res.json(request);
  } catch {
    res.status(500).json({ error: 'Failed to complete' });
  }
};

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be 1–5' }); return;
  }
  try {
    const request = await prisma.cleaningRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { feedback: rating },
    });
    res.json(request);
  } catch {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};