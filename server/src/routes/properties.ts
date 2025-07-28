import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { createPropertySchema, updatePropertySchema } from '../validation/property.validation'
import {
  getAllPropertiesController,
  getPropertyById,
  createPropertyController,
  updatePropertyController,
  deletePropertyController
} from '../controllers/property.controller'

const router = express.Router()

// GET /api/properties - Get all properties (Admin only) or properties by client ID
router.get('/', authMiddleware, getAllPropertiesController)

// GET /api/properties/:id - Get property by ID (Admin only)
router.get('/:id', authMiddleware, requireAdmin, getPropertyById)

// POST /api/properties - Create new property (Admin only)
router.post('/', authMiddleware, requireAdmin, validateRequest(createPropertySchema), createPropertyController)

// ?Future Scope: PUT /api/properties/:id - Update property (Admin only)
router.put('/:id', authMiddleware, requireAdmin, validateRequest(updatePropertySchema), updatePropertyController)

// ?Future Scope: DELETE /api/properties/:id - Delete property (Admin only)
router.delete('/:id', authMiddleware, requireAdmin, deletePropertyController)

export { router as propertyRoutes }