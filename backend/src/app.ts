import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/courseRoute';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/courses', courseRoutes);

export default app;
