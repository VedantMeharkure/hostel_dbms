import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const listRooms = async (req: Request, res: Response): Promise<void> => {
  const { type, status, floor } = req.query;
  const rooms = await prisma.room.findMany({
    where: {
      ...(type   && { type:   type   as any }),
      ...(status && { status: status as any }),
      ...(floor  && { floor:  parseInt(floor as string) }),
    },
    include: {
      students: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { number: 'asc' },
  });
  res.json(rooms);
};

export const getRoom = async (req: Request, res: Response): Promise<void> => {
  const room = await prisma.room.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { students: { include: { user: true } } },
  });
  if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
  res.json(room);
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  const { number, type, floor, capacity, rent, amenities } = req.body;
  try {
    const room = await prisma.room.create({
      data: { number, type, floor, capacity, rent, amenities: JSON.stringify(amenities ?? []) },
    });
    res.status(201).json(room);
  } catch (err: any) {
    if (err.code === 'P2002') { res.status(409).json({ error: 'Room number already exists' }); return; }
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.amenities) data.amenities = JSON.stringify(data.amenities);
    const room = await prisma.room.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(room);
  } catch {
    res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  const room = await prisma.room.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { students: true },
  });
  if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
  if (room.students.length > 0) {
    res.status(400).json({ error: 'Cannot delete a room with students assigned' });
    return;
  }
  await prisma.room.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Room deleted' });
};

export const allocateRoom = async (req: Request, res: Response): Promise<void> => {
  const roomId = parseInt(req.params.id);
  const { studentId } = req.body;
  const room = await prisma.room.findUnique({ where: { id: roomId }, include: { students: true } });
  if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
  if (room.students.length >= room.capacity) {
    res.status(400).json({ error: 'Room is full' }); return;
  }
  const newOccupied = room.occupied + 1;
  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { roomId } }),
    prisma.room.update({
      where: { id: roomId },
      data: { occupied: newOccupied, status: newOccupied >= room.capacity ? 'FULL' : 'AVAILABLE' },
    }),
  ]);
  res.json({ message: 'Room allocated' });
};

export const transferRoom = async (req: Request, res: Response): Promise<void> => {
  const fromRoomId = parseInt(req.params.id);
  const { studentId, toRoomId } = req.body;
  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { roomId: parseInt(toRoomId) } }),
    prisma.room.update({ where: { id: fromRoomId }, data: { occupied: { decrement: 1 }, status: 'AVAILABLE' } }),
    prisma.room.update({ where: { id: parseInt(toRoomId) }, data: { occupied: { increment: 1 } } }),
  ]);
  res.json({ message: 'Transfer successful' });
};