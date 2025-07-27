import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { updateUserProfileSchema, sendOtpSchema, verifyOtpSchema } from '../validation/users.validation'
import { 
  getUserProfile, 
  updateUserProfile, 
  sendOtp, 
  verifyOtp 
} from '../controllers/users.controller'

const router = express.Router()

// GET /api/users/profile/:id? - Get user profile
router.get('/profile/:id?', authMiddleware, getUserProfile)

// PUT /api/users/profile - Update user profile
router.put('/profile', authMiddleware, validateRequest(updateUserProfileSchema), updateUserProfile)

// POST /api/users/send-otp - Send OTP to email
router.post('/send-otp', validateRequest(sendOtpSchema), sendOtp)

// POST /api/users/verify-otp - Verify OTP
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp)

export { router as usersRoutes }