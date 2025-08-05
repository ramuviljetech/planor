import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { updateUserProfileSchema, sendOtpSchema, verifyOtpSchema, changePasswordSchema } from '../validation/users.validation'
import { 
  getUserProfile, 
  updateUserProfile, 
  getusersAssociatedWithClient
} from '../controllers/users.controller'

const router = express.Router()

// ?Future Scope: GET /api/users/profile/:id? - Get user profile
router.get('/profile/:id?', authMiddleware, getUserProfile)

// ?Future Scope: PUT /api/users/profile - Update user profile
router.put('/profile', authMiddleware, validateRequest(updateUserProfileSchema), updateUserProfile)

//* GET /api/users/get-users - Get users associated with client
router.get('/get-users/:clientId?', authMiddleware, requireAdmin, getusersAssociatedWithClient)

export { router as usersRoutes }