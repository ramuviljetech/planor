import { Router } from 'express';
import {
  getAllBuildingsController,
  getBuildingById,
  createBuildingController,
} from '../controllers/building.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createBuildingSchema, updateBuildingSchema } from '../validation/building.validation';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all buildings (with optional clientId or propertyId query parameters)
router.get('/', authMiddleware, requireAdmin, getAllBuildingsController);

// Get building by ID
router.get('/:id', authMiddleware, requireAdmin, getBuildingById);

// Create new building (Admin only)
router.post('/', authMiddleware, requireAdmin, validateRequest(createBuildingSchema), createBuildingController);





export { router as buildingRoutes }; 