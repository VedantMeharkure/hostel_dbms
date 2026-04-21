const express = require('express');
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

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cleaning', cleaningRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;