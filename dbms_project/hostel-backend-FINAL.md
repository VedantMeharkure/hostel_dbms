# 🏠 HostelPro — COMPLETE BACKEND (Clean & Simple)

> No PDF/Invoice · No File Uploads · No Redis · No Rate Limiting · No Payment Gateways
> Just: Express + MySQL + Prisma + JWT + bcrypt. That's it.

---

## 📁 Final Project Structure

```
hostel-management/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── rooms/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── students/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── payments/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── events/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── food/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── cleaning/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   ├── sports/
│   │   │   │   ├── routes.ts
│   │   │   │   └── controller.ts
│   │   │   └── admin/
│   │   │       ├── routes.ts
│   │   │       └── controller.ts
│   │   └── utils/
│   │       └── email.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    └── hostel-management-system.jsx   ← (your existing file, drop it in)
```

---

## 🗄️ DATABASE SCHEMA

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  STUDENT
  STAFF
}

enum RoomType {
  SINGLE
  DOUBLE
  SHARED
}

enum RoomStatus {
  AVAILABLE
  FULL
  MAINTENANCE
}

enum PaymentType {
  MONTHLY
  SEMESTER
  ONE_TIME
}

enum PaymentStatus {
  PAID
  PENDING
  OVERDUE
}

enum EventCategory {
  CULTURAL
  SPORTS
  MEETING
  GENERAL
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum MealPlan {
  MONTHLY
  DAILY
  ONE_TIME
}

enum CleaningType {
  REGULAR
  DEEP_CLEAN
  BATHROOM
  WINDOW
}

enum CleaningStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id           Int            @id @default(autoincrement())
  email        String         @unique
  passwordHash String
  name         String
  phone        String?
  role         Role           @default(STUDENT)
  isActive     Boolean        @default(true)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  student      Student?
  staff        Staff?
  auditLogs    AuditLog[]
  eventRSVPs   EventRSVP[]

  @@map("users")
}

model Student {
  id          Int                @id @default(autoincrement())
  userId      Int                @unique
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  course      String
  year        Int
  joinDate    DateTime
  roomId      Int?
  room        Room?              @relation(fields: [roomId], references: [id])

  payments    Payment[]
  meals       MealSubscription[]
  cleanReqs   CleaningRequest[]
  sportIssues EquipmentIssue[]

  @@map("students")
}

model Staff {
  id          Int               @id @default(autoincrement())
  userId      Int               @unique
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  department  String
  shift       String?

  cleaningAssigned CleaningRequest[]

  @@map("staff")
}

model Room {
  id        Int        @id @default(autoincrement())
  number    String     @unique
  type      RoomType
  floor     Int
  capacity  Int
  occupied  Int        @default(0)
  rent      Decimal    @db.Decimal(10, 2)
  status    RoomStatus @default(AVAILABLE)
  amenities String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  students  Student[]
  payments  Payment[]

  @@map("rooms")
}

model Payment {
  id            Int           @id @default(autoincrement())
  studentId     Int
  student       Student       @relation(fields: [studentId], references: [id])
  roomId        Int?
  room          Room?         @relation(fields: [roomId], references: [id])
  amount        Decimal       @db.Decimal(10, 2)
  type          PaymentType
  status        PaymentStatus @default(PENDING)
  dueDate       DateTime
  paidDate      DateTime?
  paymentMethod String?
  notes         String?
  createdAt     DateTime      @default(now())

  @@map("payments")
}

model Event {
  id          Int           @id @default(autoincrement())
  title       String
  description String?       @db.Text
  date        DateTime
  endDate     DateTime?
  category    EventCategory
  status      EventStatus   @default(UPCOMING)
  organizer   String
  createdAt   DateTime      @default(now())

  rsvps       EventRSVP[]

  @@map("events")
}

model EventRSVP {
  id        Int      @id @default(autoincrement())
  eventId   Int
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  going     Boolean
  createdAt DateTime @default(now())

  @@unique([eventId, userId])
  @@map("event_rsvps")
}

model MealSubscription {
  id        Int      @id @default(autoincrement())
  studentId Int
  student   Student  @relation(fields: [studentId], references: [id])
  plan      MealPlan
  startDate DateTime
  endDate   DateTime?
  amount    Decimal   @db.Decimal(10, 2)
  isPaid    Boolean   @default(false)
  isActive  Boolean   @default(true)

  @@map("meal_subscriptions")
}

model WeeklyMenu {
  id        Int      @id @default(autoincrement())
  day       String
  breakfast String
  lunch     String
  dinner    String
  weekStart DateTime

  @@unique([day, weekStart])
  @@map("weekly_menus")
}

model CleaningRequest {
  id           Int            @id @default(autoincrement())
  studentId    Int
  student      Student        @relation(fields: [studentId], references: [id])
  roomNumber   String
  type         CleaningType
  priority     Priority       @default(MEDIUM)
  status       CleaningStatus @default(PENDING)
  scheduledAt  DateTime?
  completedAt  DateTime?
  assignedToId Int?
  assignedTo   Staff?         @relation(fields: [assignedToId], references: [id])
  notes        String?
  feedback     Int?
  createdAt    DateTime       @default(now())

  @@map("cleaning_requests")
}

model SportsEquipment {
  id        Int              @id @default(autoincrement())
  name      String
  total     Int
  available Int
  condition String
  createdAt DateTime         @default(now())

  issues    EquipmentIssue[]

  @@map("sports_equipment")
}

model EquipmentIssue {
  id          Int             @id @default(autoincrement())
  equipmentId Int
  equipment   SportsEquipment @relation(fields: [equipmentId], references: [id])
  studentId   Int
  student     Student         @relation(fields: [studentId], references: [id])
  issuedAt    DateTime        @default(now())
  returnedAt  DateTime?
  notes       String?

  @@map("equipment_issues")
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  action    String
  module    String
  createdAt DateTime @default(now())

  @@map("audit_logs")
}
```

---

## ⚙️ CONFIG

### `src/config/database.ts`

```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
}
```

---

## 🛡️ MIDDLEWARE

### `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: { id: number; role: string; email: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
```

---

### `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', err.message);
  res.status(err.statusCode ?? 500).json({
    error: err.message ?? 'Internal server error',
  });
}
```

---

## 📧 UTILS

### `src/utils/email.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.SMTP_USER) return; // skip if email not configured
  try {
    await transporter.sendMail({
      from: `HostelPro <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.warn('Email failed (non-fatal):', err);
  }
}
```

---

## 🚀 APP ENTRY

### `src/server.ts`

```typescript
import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 HostelPro running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
```

---

### `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/routes';
import roomRoutes from './modules/rooms/routes';
import studentRoutes from './modules/students/routes';
import paymentRoutes from './modules/payments/routes';
import eventRoutes from './modules/events/routes';
import foodRoutes from './modules/food/routes';
import cleaningRoutes from './modules/cleaning/routes';
import sportsRoutes from './modules/sports/routes';
import adminRoutes from './modules/admin/routes';

const app = express();

app.use(cors({ origin: '*' }));        // allow all origins for dev
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',     authRoutes);
app.use('/api/rooms',    roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/food',     foodRoutes);
app.use('/api/cleaning', cleaningRoutes);
app.use('/api/sports',   sportsRoutes);
app.use('/api/admin',    adminRoutes);

app.use(errorHandler);

export default app;
```

---

## 🔐 MODULE: AUTH

### `src/modules/auth/routes.ts`

```typescript
import { Router } from 'express';
import { login, register, forgotPassword, resetPassword } from './controller';

const router = Router();

router.post('/login',           login);
router.post('/register',        register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

export default router;
```

### `src/modules/auth/controller.ts`

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { sendEmail } from '../../utils/email';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, phone, role = 'STUDENT' } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, passwordHash, name, phone, role } });
    res.status(201).json({ message: 'Registered successfully' });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await sendEmail(
        email,
        'Reset your HostelPro password',
        `<p>Click to reset: <a href="${resetUrl}">${resetUrl}</a> (expires in 1 hour)</p>`,
      );
    }
    // Always return same response to prevent email enumeration
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch {
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: payload.id }, data: { passwordHash } });
    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};
```

---

## 🏠 MODULE: ROOMS

### `src/modules/rooms/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',              ctrl.listRooms);
router.get('/:id',           ctrl.getRoom);
router.post('/',             authorize('ADMIN', 'STAFF'), ctrl.createRoom);
router.put('/:id',           authorize('ADMIN', 'STAFF'), ctrl.updateRoom);
router.delete('/:id',        authorize('ADMIN'),          ctrl.deleteRoom);
router.post('/:id/allocate', authorize('ADMIN', 'STAFF'), ctrl.allocateRoom);
router.post('/:id/transfer', authorize('ADMIN', 'STAFF'), ctrl.transferRoom);

export default router;
```

### `src/modules/rooms/controller.ts`

```typescript
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
```

---

## 👨‍🎓 MODULE: STUDENTS

### `src/modules/students/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',     ctrl.listStudents);
router.get('/:id',  ctrl.getStudent);
router.post('/',    authorize('ADMIN'),          ctrl.createStudent);
router.put('/:id',  authorize('ADMIN', 'STAFF'), ctrl.updateStudent);
router.delete('/:id', authorize('ADMIN'),        ctrl.deleteStudent);

export default router;
```

### `src/modules/students/controller.ts`

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';

export const listStudents = async (req: Request, res: Response): Promise<void> => {
  const { search, roomId } = req.query;
  const students = await prisma.student.findMany({
    where: {
      ...(roomId && { roomId: parseInt(roomId as string) }),
      ...(search && {
        user: {
          OR: [
            { name:  { contains: search as string } },
            { email: { contains: search as string } },
          ],
        },
      }),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      room: { select: { id: true, number: true, type: true } },
      payments: { orderBy: { dueDate: 'desc' }, take: 1 },
    },
    orderBy: { user: { name: 'asc' } },
  });
  res.json(students);
};

export const getStudent = async (req: Request, res: Response): Promise<void> => {
  const student = await prisma.student.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      user: true,
      room: true,
      payments: { orderBy: { createdAt: 'desc' } },
      meals: { where: { isActive: true } },
      cleanReqs: { orderBy: { createdAt: 'desc' }, take: 5 },
      sportIssues: { include: { equipment: true }, orderBy: { issuedAt: 'desc' }, take: 5 },
    },
  });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }
  res.json(student);
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, phone, course, year, joinDate, roomId } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already exists' }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, name, phone, role: 'STUDENT',
        student: {
          create: { course, year, joinDate: new Date(joinDate), ...(roomId && { roomId }) },
        },
      },
      include: { student: true },
    });

    if (roomId) {
      await prisma.room.update({
        where: { id: roomId },
        data: { occupied: { increment: 1 } },
      });
    }
    const { passwordHash: _, ...safe } = user as any;
    res.status(201).json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to create student' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, course, year, roomId } = req.body;
  const studentId = parseInt(req.params.id);
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    // Handle room change
    if (roomId !== undefined && roomId !== student.roomId) {
      if (student.roomId) {
        await prisma.room.update({
          where: { id: student.roomId },
          data: { occupied: { decrement: 1 }, status: 'AVAILABLE' },
        });
      }
      if (roomId) {
        await prisma.room.update({
          where: { id: roomId },
          data: { occupied: { increment: 1 } },
        });
      }
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { course, year, ...(roomId !== undefined && { roomId }) },
    });

    if (name || phone) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { ...(name && { name }), ...(phone && { phone }) },
      });
    }
    res.json({ message: 'Student updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update student' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const student = await prisma.student.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { payments: { where: { status: { in: ['PENDING', 'OVERDUE'] } } } },
  });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }
  if (student.payments.length > 0) {
    res.status(400).json({ error: 'Settle pending payments before deleting' }); return;
  }
  if (student.roomId) {
    await prisma.room.update({
      where: { id: student.roomId },
      data: { occupied: { decrement: 1 }, status: 'AVAILABLE' },
    });
  }
  await prisma.user.delete({ where: { id: student.userId } });
  res.json({ message: 'Student deleted' });
};
```

---

## 💰 MODULE: PAYMENTS

### `src/modules/payments/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',                ctrl.listPayments);
router.get('/:id',             ctrl.getPayment);
router.post('/',               authorize('ADMIN', 'STAFF'), ctrl.createPayment);
router.put('/:id',             authorize('ADMIN', 'STAFF'), ctrl.updatePayment);
router.post('/:id/pay',        authorize('ADMIN', 'STAFF'), ctrl.markPaid);
router.post('/check-overdue',  authorize('ADMIN'),          ctrl.checkOverdue);

export default router;
```

### `src/modules/payments/controller.ts`

```typescript
import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const listPayments = async (req: Request, res: Response): Promise<void> => {
  const { status, studentId, type } = req.query;
  const payments = await prisma.payment.findMany({
    where: {
      ...(status    && { status:    status    as any }),
      ...(studentId && { studentId: parseInt(studentId as string) }),
      ...(type      && { type:      type      as any }),
    },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      room: { select: { number: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  res.json(payments);
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { student: { include: { user: true, room: true } } },
  });
  if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }
  res.json(payment);
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const { studentId, roomId, amount, type, dueDate, notes } = req.body;
  try {
    const payment = await prisma.payment.create({
      data: { studentId, roomId, amount, type, dueDate: new Date(dueDate), notes },
    });
    res.status(201).json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

export const markPaid = async (req: Request, res: Response): Promise<void> => {
  const { paymentMethod = 'CASH' } = req.body;
  try {
    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'PAID', paidDate: new Date(), paymentMethod },
    });
    res.json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to mark payment as paid' });
  }
};

export const checkOverdue = async (_req: Request, res: Response): Promise<void> => {
  const result = await prisma.payment.updateMany({
    where: { status: 'PENDING', dueDate: { lt: new Date() } },
    data: { status: 'OVERDUE' },
  });
  res.json({ updated: result.count });
};
```

---

## 🎉 MODULE: EVENTS

### `src/modules/events/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',          ctrl.listEvents);
router.get('/:id',       ctrl.getEvent);
router.post('/',         authorize('ADMIN', 'STAFF'), ctrl.createEvent);
router.put('/:id',       authorize('ADMIN', 'STAFF'), ctrl.updateEvent);
router.delete('/:id',    authorize('ADMIN'),          ctrl.deleteEvent);
router.post('/:id/rsvp', ctrl.rsvpEvent);

export default router;
```

### `src/modules/events/controller.ts`

```typescript
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
```

---

## 🍽️ MODULE: FOOD

### `src/modules/food/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/menu',                  ctrl.getWeeklyMenu);
router.put('/menu/:day',             authorize('ADMIN', 'STAFF'), ctrl.updateMenuDay);
router.get('/subscriptions',         ctrl.listSubscriptions);
router.post('/subscriptions',        authorize('ADMIN', 'STAFF'), ctrl.createSubscription);
router.put('/subscriptions/:id',     authorize('ADMIN', 'STAFF'), ctrl.updateSubscription);
router.post('/subscriptions/:id/pay',authorize('ADMIN', 'STAFF'), ctrl.markSubscriptionPaid);

export default router;
```

### `src/modules/food/controller.ts`

```typescript
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
```

---

## 🧹 MODULE: CLEANING

### `src/modules/cleaning/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',               ctrl.listRequests);
router.get('/:id',            ctrl.getRequest);
router.post('/',              ctrl.createRequest);
router.put('/:id',            authorize('ADMIN', 'STAFF'), ctrl.updateRequest);
router.post('/:id/assign',    authorize('ADMIN', 'STAFF'), ctrl.assignRequest);
router.post('/:id/complete',  authorize('ADMIN', 'STAFF'), ctrl.completeRequest);
router.post('/:id/feedback',  ctrl.submitFeedback);

export default router;
```

### `src/modules/cleaning/controller.ts`

```typescript
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
```

---

## 🏀 MODULE: SPORTS

### `src/modules/sports/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',            ctrl.listEquipment);
router.get('/:id',         ctrl.getEquipment);
router.post('/',           authorize('ADMIN', 'STAFF'), ctrl.addEquipment);
router.put('/:id',         authorize('ADMIN', 'STAFF'), ctrl.updateEquipment);
router.delete('/:id',      authorize('ADMIN'),          ctrl.deleteEquipment);
router.post('/:id/issue',  authorize('ADMIN', 'STAFF'), ctrl.issueEquipment);
router.post('/:id/return', authorize('ADMIN', 'STAFF'), ctrl.returnEquipment);
router.get('/issues/all',  authorize('ADMIN', 'STAFF'), ctrl.listIssues);

export default router;
```

### `src/modules/sports/controller.ts`

```typescript
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
```

---

## ⚙️ MODULE: ADMIN

### `src/modules/admin/routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard',        ctrl.getDashboard);
router.get('/users',            ctrl.listUsers);
router.put('/users/:id',        ctrl.updateUser);
router.delete('/users/:id',     ctrl.deleteUser);
router.put('/users/:id/toggle', ctrl.toggleUserStatus);
router.get('/audit-logs',       ctrl.getAuditLogs);

export default router;
```

### `src/modules/admin/controller.ts`

```typescript
import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalRooms,
      availableRooms,
      pendingPayments,
      overduePayments,
      paidRevenue,
      pendingCleaning,
      upcomingEvents,
      activeIssues,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.room.count(),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'OVERDUE' } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.cleaningRequest.count({ where: { status: 'PENDING' } }),
      prisma.event.count({ where: { status: 'UPCOMING' } }),
      prisma.equipmentIssue.count({ where: { returnedAt: null } }),
    ]);

    const roomsByType = await prisma.room.groupBy({
      by: ['type'],
      _sum: { capacity: true, occupied: true },
      _count: { type: true },
    });

    const recentPayments = await prisma.payment.findMany({
      where: { status: 'PAID' },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { paidDate: 'desc' },
      take: 5,
    });

    res.json({
      summary: {
        totalStudents,
        totalRooms,
        availableRooms,
        occupiedRooms: totalRooms - availableRooms,
        pendingPayments,
        overduePayments,
        totalRevenue: Number(paidRevenue._sum.amount ?? 0),
        pendingCleaning,
        upcomingEvents,
        activeIssues,
      },
      roomsByType,
      recentPayments,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const { role, search } = req.query;
  const users = await prisma.user.findMany({
    where: {
      ...(role && { role: role as any }),
      ...(search && {
        OR: [
          { name:  { contains: search as string } },
          { email: { contains: search as string } },
        ],
      }),
    },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, isActive: true, createdAt: true,
      student: { select: { id: true, course: true, room: { select: { number: true } } } },
      staff:   { select: { id: true, department: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, role, isActive } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name     !== undefined && { name }),
        ...(phone    !== undefined && { phone }),
        ...(role     !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    const { passwordHash: _, ...safe } = user as any;
    res.json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const updated = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data: { isActive: !user.isActive },
  });
  res.json({ isActive: updated.isActive });
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  const { module } = req.query;
  const logs = await prisma.auditLog.findMany({
    where: { ...(module && { module: module as string }) },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(logs);
};
```

---

## 🌱 SEED FILE

### `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@hostel.com' },
    update: {},
    create: { email: 'admin@hostel.com', passwordHash: await hash('Admin@123'), name: 'Admin', role: 'ADMIN' },
  });

  // Staff
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@hostel.com' },
    update: {},
    create: {
      email: 'staff@hostel.com', passwordHash: await hash('Staff@123'), name: 'Rajesh Kumar', role: 'STAFF',
      staff: { create: { department: 'CLEANING' } },
    },
    include: { staff: true },
  });

  // Rooms
  const rooms = await Promise.all([
    prisma.room.upsert({ where: { number: 'A-101' }, update: {}, create: { number: 'A-101', type: 'SINGLE', floor: 1, capacity: 1, rent: 8000, amenities: '["AC","WiFi","Attached Bath"]' } }),
    prisma.room.upsert({ where: { number: 'B-201' }, update: {}, create: { number: 'B-201', type: 'DOUBLE', floor: 2, capacity: 2, rent: 5500, amenities: '["Fan","WiFi"]' } }),
    prisma.room.upsert({ where: { number: 'C-301' }, update: {}, create: { number: 'C-301', type: 'SHARED', floor: 3, capacity: 4, rent: 3500, amenities: '["Fan"]' } }),
    prisma.room.upsert({ where: { number: 'A-102' }, update: {}, create: { number: 'A-102', type: 'SINGLE', floor: 1, capacity: 1, rent: 8000, amenities: '["AC","WiFi","Attached Bath"]' } }),
  ]);

  // Students
  const studentData = [
    { email: 'arjun@student.com',  name: 'Arjun Sharma', course: 'B.Tech CSE', year: 2 },
    { email: 'priya@student.com',  name: 'Priya Patel',  course: 'MBA',        year: 1 },
    { email: 'rohit@student.com',  name: 'Rohit Verma',  course: 'B.Com',      year: 3 },
  ];

  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const room = rooms[i];
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email, passwordHash: await hash('Student@123'), name: s.name, role: 'STUDENT',
        student: { create: { course: s.course, year: s.year, joinDate: new Date('2024-07-01'), roomId: room.id } },
      },
    });
    await prisma.room.update({ where: { id: room.id }, data: { occupied: { increment: 1 } } });
  }

  // Events
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Annual Sports Day',  description: 'Inter-hostel tournament', date: new Date('2025-02-15'), category: 'SPORTS',   organizer: 'Admin',          status: 'UPCOMING' },
      { title: 'Cultural Night',     description: 'Music and food festival', date: new Date('2025-01-25'), category: 'CULTURAL', organizer: 'Student Council', status: 'UPCOMING' },
      { title: 'Monthly Meeting',    description: 'Hostel announcements',    date: new Date('2024-12-10'), category: 'MEETING',  organizer: 'Warden',         status: 'COMPLETED' },
    ],
  });

  // Sports Equipment
  await prisma.sportsEquipment.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Basketball',        total: 6,  available: 4, condition: 'GOOD' },
      { name: 'Football',          total: 4,  available: 4, condition: 'EXCELLENT' },
      { name: 'Cricket Bat',       total: 8,  available: 6, condition: 'GOOD' },
      { name: 'Badminton Racket',  total: 12, available: 10, condition: 'GOOD' },
    ],
  });

  // Sample payments
  const students = await prisma.student.findMany({ include: { room: true }, take: 3 });
  for (const s of students) {
    if (!s.room) continue;
    await prisma.payment.create({
      data: { studentId: s.id, roomId: s.room.id, amount: s.room.rent, type: 'MONTHLY', status: 'PAID', dueDate: new Date('2025-01-01'), paidDate: new Date(), paymentMethod: 'UPI' },
    });
    await prisma.payment.create({
      data: { studentId: s.id, roomId: s.room.id, amount: s.room.rent, type: 'MONTHLY', status: 'PENDING', dueDate: new Date('2025-02-01') },
    });
  }

  // Cleaning request sample
  const firstStudent = await prisma.student.findFirst();
  if (firstStudent && staffUser.staff) {
    await prisma.cleaningRequest.create({
      data: { studentId: firstStudent.id, roomNumber: 'A-101', type: 'REGULAR', priority: 'HIGH', status: 'PENDING' },
    });
  }

  console.log('✅ Done!');
  console.log('Admin:   admin@hostel.com  / Admin@123');
  console.log('Staff:   staff@hostel.com  / Staff@123');
  console.log('Student: arjun@student.com / Student@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

---

## 📦 PACKAGE.JSON

### `package.json`

```json
{
  "name": "hostelpro-backend",
  "version": "1.0.0",
  "scripts": {
    "dev":    "ts-node-dev --respawn --transpile-only src/server.ts",
    "build":  "tsc",
    "start":  "node dist/server.js",
    "seed":   "ts-node prisma/seed.ts",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.8.0",
    "bcryptjs":       "^2.4.3",
    "cors":           "^2.8.5",
    "express":        "^4.18.2",
    "jsonwebtoken":   "^9.0.2",
    "morgan":         "^1.10.0",
    "nodemailer":     "^6.9.8"
  },
  "devDependencies": {
    "@types/bcryptjs":    "^2.4.6",
    "@types/cors":        "^2.8.17",
    "@types/express":     "^4.17.21",
    "@types/jsonwebtoken":"^9.0.5",
    "@types/morgan":      "^1.9.9",
    "@types/node":        "^20.11.0",
    "@types/nodemailer":  "^6.4.14",
    "prisma":             "^5.8.0",
    "ts-node":            "^10.9.2",
    "ts-node-dev":        "^2.0.0",
    "typescript":         "^5.3.3"
  }
}
```

---

## 🔧 TSCONFIG.JSON

```json
{
  "compilerOptions": {
    "target":                     "ES2020",
    "module":                     "CommonJS",
    "outDir":                     "./dist",
    "rootDir":                    "./src",
    "strict":                     true,
    "esModuleInterop":            true,
    "skipLibCheck":               true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🌍 .ENV FILE

```env
# App
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/hostel_db"

# JWT (change this to any long random string)
JWT_SECRET=my-super-secret-key-change-this-in-production

# Email (optional — leave blank to skip emails)
SMTP_HOST=smtp.gmail.com
SMTP_USER=
SMTP_PASS=
```

---

## ✅ WHAT'S REMOVED (vs previous versions)

| Feature | Removed? | Why |
|---------|----------|-----|
| PDF invoice generator (PDFKit) | ✅ Removed | Not needed |
| File uploads (Cloudinary/S3/Multer) | ✅ Removed | Not needed |
| Redis caching | ✅ Removed | Adds complexity |
| Helmet (security headers) | ✅ Removed | Not needed for dev |
| Rate limiting | ✅ Removed | Not needed for dev |
| Razorpay / Stripe payment gateways | ✅ Removed | Not needed |
| Socket.io real-time | ✅ Removed | Not needed |
| json2csv export | ✅ Removed | Not needed |
| JWT refresh tokens | ✅ Removed | Single token is fine |
| Joi validation middleware | ✅ Removed | Basic checks in controllers |
| Audit log middleware | ✅ Simplified | AuditLog model kept, middleware removed |
| MealFeedback model | ✅ Removed | Simplified |

---

## 🚀 HOW TO RUN

### Prerequisites
- Node.js 18+
- MySQL 8 running locally (or via Docker)

### Step 1 — MySQL via Docker (easiest)
```bash
docker run -d \
  --name hostel-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=hostel_db \
  -p 3306:3306 \
  mysql:8
```
> No Docker? Install MySQL locally and create a database called `hostel_db`.

### Step 2 — Install & Configure
```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Edit DATABASE_URL if your MySQL password differs
```

### Step 3 — Database Setup
```bash
npx prisma migrate dev --name init
# This creates all tables in MySQL

npm run seed
# This fills the database with sample data
```

### Step 4 — Start the Backend
```bash
npm run dev
# Running at http://localhost:5000
```

### Step 5 — Start the Frontend
The `hostel-management-system.jsx` file is a standalone React app.
Drop it into a new Vite project:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
# Replace src/App.jsx with hostel-management-system.jsx content
# Add this to index.html: <script src="https://cdn.tailwindcss.com"></script>
npm run dev
# Running at http://localhost:5173
```

### Step 6 — Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | Admin@123 |
| Staff | staff@hostel.com | Staff@123 |
| Student | arjun@student.com | Student@123 |

### Prisma Studio (database GUI)
```bash
npm run studio
# Opens visual database browser at http://localhost:5555
```
