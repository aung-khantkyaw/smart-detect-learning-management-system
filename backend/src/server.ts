import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes';
import departmentRoutes from './routes/departmentRoutes';
import positionRoutes from './routes/positionRoutes';
import majorRoutes from './routes/majorRoutes';
import academicYearRoutes from './routes/academicYearRoutes';
import courseRoutes from './routes/courseRoutes';
import courseOfferingRoutes from './routes/courseOfferingRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-offerings', courseOfferingRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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
    const tableNames = result.map((row:{ table_name: string })=> row.table_name);

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

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database test: http://localhost:${PORT}/api/test-db`);
  
  try {
    const { testConnection } = await import('./db');
    await testConnection();
  } catch (error) {
    console.error('Failed to connect to database on startup:', error);
  }
});
