import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { updateUserSchema } from '../validation/admin.validation'
import {
  createNewUsers,
  updateUser,
  getStandardUsers,
  deleteStandardUser
} from '../controllers/admin.controller'

const router = express.Router()

// POST /api/admin/clients - Create new client or standard user (Admin only)
// Validation is handled inside the controller based on request type
router.post('/register', authMiddleware, requireAdmin,createNewUsers)

// PUT /api/admin/profile/:id - Update user (Admin only)
router.put('/profile/:id', authMiddleware, requireAdmin, validateRequest(updateUserSchema), updateUser)

// GET /api/admin/standard-users - Get all standard users only
router.get('/standard-users', authMiddleware, requireAdmin, getStandardUsers)

// DELETE /api/admin/delete-users/:id - Delete standard user
router.delete('/delete-users/:id', authMiddleware, requireAdmin, deleteStandardUser)

export { router as adminRoutes }
