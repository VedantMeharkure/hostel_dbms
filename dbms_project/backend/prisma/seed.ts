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