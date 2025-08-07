import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { updateUserSchema, createMultipleUsersSchema } from '../validation/admin.validation'
import {
  updateUser,
  getStandardUsers,
  deleteStandardUser,
  getMaintenanceCosts,
  registerUsers
} from '../controllers/admin.controller'

const router = express.Router()


// POST /api/admin/register-users - Create multiple users (Admin only)
router.post('/register-users', authMiddleware, requireAdmin, validateRequest(createMultipleUsersSchema), registerUsers)

// ?Future Scope: PUT /api/admin/profile/:id - Update user (Admin only)
router.put('/profile/:id', authMiddleware, requireAdmin, validateRequest(updateUserSchema), updateUser)

// ?Future Scope:GET /api/admin/standard-users - Get all standard users only
router.get('/standard-users', authMiddleware, requireAdmin, getStandardUsers)

// ?Future Scope: DELETE /api/admin/delete-users/:id - Delete standard user
router.delete('/delete-users/:id', authMiddleware, requireAdmin, deleteStandardUser)

// !GET /api/admin/dashboard   - Get total maintenance costs and individual costs
router.get('/dashboard', authMiddleware, getMaintenanceCosts)

export { router as adminRoutes }
