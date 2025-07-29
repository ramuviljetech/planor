import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { updateUserProfileSchema, sendOtpSchema, verifyOtpSchema, changePasswordSchema } from '../validation/users.validation'
import { 
  getUserProfile, 
  updateUserProfile, 
  sendOtp, 
  verifyOtp,
  changePassword
} from '../controllers/users.controller'

const router = express.Router()

// ?Future Scope: GET /api/users/profile/:id? - Get user profile
router.get('/profile/:id?', authMiddleware, getUserProfile)

// ?Future Scope: PUT /api/users/profile - Update user profile
router.put('/profile', authMiddleware, validateRequest(updateUserProfileSchema), updateUserProfile)

// POST /api/users/send-otp - Send OTP to email
router.post('/send-otp', validateRequest(sendOtpSchema), sendOtp)

// POST /api/users/verify-otp - Verify OTP
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp)

// POST /api/users/change-password - Change password
router.post('/change-password', validateRequest(changePasswordSchema), changePassword)

export { router as usersRoutes }