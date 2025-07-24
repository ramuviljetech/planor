import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authRoutes } from './src/routes/auth';
import userRoutes from './src/routes/users';
import { propertyRoutes } from './src/routes/properties';
import { buildingRoutes } from './src/routes/buildings';
import { fileRoutes } from './src/routes/files';
import { maintenanceRoutes } from './src/routes/maintenance';
import { errorHandler } from './src/middleware/errorHandler';
import { authMiddleware } from './src/middleware/auth';
import { initializeDatabase } from './src/config/database';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug environment variables
console.log('🔍 Environment variables loaded:');
console.log('- PORT:', process.env.PORT || '3001 (default)');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000 (default)');
console.log('- COSMOS_DB_ENDPOINT:', process.env.COSMOS_DB_ENDPOINT ? 'Set' : 'Not set');
console.log('- COSMOS_DB_KEY:', process.env.COSMOS_DB_KEY ? 'Set' : 'Not set');
console.log('- COSMOS_DB_NAME:', process.env.COSMOS_DB_NAME || 'planor-portal (default)');
console.log('');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Planör Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/properties', authMiddleware, propertyRoutes);
app.use('/api/buildings', authMiddleware, buildingRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Planör Portal API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 