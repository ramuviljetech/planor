import { Router } from 'express';
import {
  getAllBuildingsController,
  getBuildingById,
  createBuildingController,
  updateBuildingController,
} from '../controllers/building.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createBuildingSchema, updateBuildingSchema } from '../validation/building.validation';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { AccessControl } from '../middleware/accessController';

const router = Router();

// Get all buildings (with optional clientId or propertyId query parameters)
router.get('/', authMiddleware, AccessControl, getAllBuildingsController);

// Get building by ID
router.get('/:id', authMiddleware, getBuildingById);

// Create new building (Admin only)
router.post('/', authMiddleware, requireAdmin, validateRequest(createBuildingSchema), createBuildingController);

// !Update building maintenance date
router.put('/update-maintenance', authMiddleware, requireAdmin, validateRequest(updateBuildingSchema), updateBuildingController);




export { router as buildingRoutes }; 