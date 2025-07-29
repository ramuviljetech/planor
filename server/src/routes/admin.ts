import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { getClientsSchema, unifiedClientUserSchema, updateUserSchema } from '../validation/admin.validation'
import {
  createNewUsers,
  updateUser,
  getStandardUsers,
  deleteStandardUser,
  getClients
} from '../controllers/admin.controller'

const router = express.Router()

// POST /api/admin/clients - Create new client or standard user (Admin only)
// Validation is handled inside the controller based on request type
router.post('/register', authMiddleware, requireAdmin,validateRequest(unifiedClientUserSchema),createNewUsers)

// ?Future Scope: PUT /api/admin/profile/:id - Update user (Admin only)
router.put('/profile/:id', authMiddleware, requireAdmin, validateRequest(updateUserSchema), updateUser)

// ?Future Scope:GET /api/admin/standard-users - Get all standard users only
router.get('/standard-users', authMiddleware, requireAdmin, getStandardUsers)

// ?Future Scope: DELETE /api/admin/delete-users/:id - Delete standard user
router.delete('/delete-users/:id', authMiddleware, requireAdmin, deleteStandardUser)

// POST /api/admin/clients - Get clients with filters
router.post('/get-clients', authMiddleware, requireAdmin, validateRequest(getClientsSchema), getClients)


export { router as adminRoutes }
