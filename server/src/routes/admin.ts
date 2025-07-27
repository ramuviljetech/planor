import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { registerUserSchema, updateUserSchema } from '../validation/admin.validation'
import { 
  registerUser, 
  updateUser, 
  getStandardUsers, 
  deleteClient, 
  deleteStandardUser 
} from '../controllers/admin.controller'

const router = express.Router()

// POST /api/admin/register - User registration (Admin only)
router.post('/register', authMiddleware, requireAdmin, validateRequest(registerUserSchema), registerUser)

// PUT /api/admin/profile/:id - Update user (Admin only)
router.put('/profile/:id', authMiddleware, requireAdmin, validateRequest(updateUserSchema), updateUser)

// GET /api/admin/standard-users - Get all standard users only
router.get('/standard-users', authMiddleware, requireAdmin, getStandardUsers)

// DELETE /api/admin/delete-clients/:id - Delete client
router.delete('/delete-clients/:id', authMiddleware, requireAdmin, deleteClient)

// DELETE /api/admin/delete-users/:id - Delete standard user
router.delete('/delete-users/:id', authMiddleware, requireAdmin, deleteStandardUser)

export { router as adminRoutes }
