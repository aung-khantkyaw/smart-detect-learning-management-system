import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { SocketService } from './services/socketService';
import path from 'path';

import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes';
import departmentRoutes from './routes/departmentRoutes';
import positionRoutes from './routes/positionRoutes';
import majorRoutes from './routes/majorRoutes';
import academicYearRoutes from './routes/academicYearRoutes';
import courseRoutes from './routes/courseRoutes';
import courseOfferingRoutes from './routes/courseOfferingRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import chatRoutes from './routes/chatRoutes';
import chatRoomRoutes from './routes/chatRoomRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import announcementRoutes from './routes/announcementRoutes';
import materialRoutes from './routes/materialRoutes';
import quizRoutes from './routes/quizRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aiFlagRoutes from './routes/aiFlagRoutes';
import backupRoutes from './routes/backupRoutes';
import cacheRoutes from './routes/cacheRoutes';
import { warmInitialCaches } from './cache/cacheWarmer';
import { prometheusMiddleware, metricsHandler } from './metrics/promMetrics';
import metricsUiRoutes from './routes/metricsUiRoutes';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
// Allow multiple origins in CLIENT_URL, comma-separated
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});
// Make io accessible in controllers via req.app.get('io')
app.set('io', io);
const PORT: number = Number(process.env.PORT) || 3000;

// Middleware
// Configure Helmet to allow cross-origin resource policy so assets under /uploads can be embedded cross-origin
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Express CORS using same allowed origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());
// Prometheus metrics middleware (must run after body parsing but before routes)
app.use(prometheusMiddleware);
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// Directory: backend/uploads -> accessible at /uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    // Ensure media can be consumed cross-origin without being blocked by CORP
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Helpful caching headers for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

app.use((req,res,next)=>{
  const start = performance.now();
  res.on('finish', ()=>{
    const ms = performance.now() - start;
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${ms.toFixed(2)} ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-offerings', courseOfferingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat-rooms', chatRoomRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-flag', aiFlagRoutes);
app.use('/api/admin', backupRoutes);
app.use('/api/cache', cacheRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', NODE_ENV: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Prometheus metrics exposition (text/plain OpenMetrics format)
app.get('/metrics', metricsHandler);
// Human-friendly live dashboard & json
app.use('/metrics', metricsUiRoutes);

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const { db, testConnection } = await import('./db');
    const { users } = await import('./db/schema');
    
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection test failed');
    }
    
    const result = await db.$client<[{ table_name: string }]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableNames = result.map((row) => row.table_name);
    res.json({ 
      status: 'Database connected successfully',
      tableCount: tableNames.length,
      tables: tableNames,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize Socket.IO service
const socketService = new SocketService(io);

// Make socketService available globally for controllers
declare global {
  var socketService: SocketService;
}
global.socketService = socketService;

server.listen(PORT, '0.0.0.0', async () => {

  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database test: http://localhost:${PORT}/api/test-db`);
  
  try {
    const { testConnection } = await import('./db');
    await testConnection();
  // Warm caches without blocking readiness significantly
  warmInitialCaches();
  } catch (error) {
    console.error('Failed to connect to database on startup:', error);
  }
});
