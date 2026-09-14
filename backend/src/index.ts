import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import invitationRoutes from './routes/invitationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reminderRoutes from './routes/reminderRoutes';
import contactRoutes from './routes/contactRoutes';
import logRoutes from './routes/logRoutes';
import reportRoutes from './routes/reportRoutes';
import exportRoutes from './routes/exportRoutes';
import profileRoutes from './routes/profileRoutes';
import { triggerDueReminders } from './controllers/reminderController';
import { VAPID_PUBLIC_KEY } from './config/vapid';

const app = express();
const PORT = process.env.PORT || 5001;

// Security HTTP headers with Helmet (allow cross-origin resources for image previews & PWA assets)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Production-ready CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      const configuredOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : [];

      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      console.warn('Blocked CORS request from origin:', origin);
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder cleanly
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Fallback handler for missing /uploads files (e.g. missing after container restart on ephemeral disk)
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  if (isImage) {
    const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="none">
      <rect width="400" height="300" fill="#0F172A"/>
      <rect x="20" y="20" width="360" height="260" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <path d="M160 130C160 141.046 151.046 150 140 150C128.954 150 120 141.046 120 130C120 118.954 128.954 110 140 110C151.046 110 160 118.954 160 130Z" fill="#38BDF8"/>
      <path d="M100 220L150 170L190 200L250 140L300 220H100Z" fill="#0284C7"/>
      <text x="200" y="250" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="13" font-weight="600">Attachment Preview Unavailable</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(svgFallback);
  }

  res.status(404).json({ error: 'Uploaded document file not found on server disk.' });
});

// Route Registrations
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/profile', profileRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EIMS Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date(),
  });
});

// Production Background Worker for Due Reminders (independent of frontend tab)
setInterval(() => {
  triggerDueReminders().catch((err) => console.error('Error in reminder cron worker:', err));
}, 5000);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Elite Invitation Management System (EIMS) API`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` VAPID Public Key Loaded: ${VAPID_PUBLIC_KEY.slice(0, 12)}...`);
  console.log(`=================================================`);
});
