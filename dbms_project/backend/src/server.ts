import 'dotenv/config';
import * as express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import roomRoutes from './routes/rooms';
import paymentRoutes from './routes/payments';
import eventRoutes from './routes/events';
import foodRoutes from './routes/food';
import cleaningRoutes from './routes/cleaning';
import sportsRoutes from './routes/sports';

const app = express.default();

app.use(cors({ origin: 'http://localhost:5173',credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cleaning', cleaningRoutes);
app.use('/api/sports', sportsRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 HostelPro running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);