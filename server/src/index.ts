import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/schema';
import { seedDatabase } from './db/seed';

import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import assessmentsRoutes from './routes/assessments';
import resourcesRoutes from './routes/resources';
import certificatesRoutes from './routes/certificates';
import adminRoutes from './routes/admin';
import feedbackRoutes from './routes/feedback';
import profileRoutes from './routes/profile';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize DB and seed
initializeDatabase();
seedDatabase();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
