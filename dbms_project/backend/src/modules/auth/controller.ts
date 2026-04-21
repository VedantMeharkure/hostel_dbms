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