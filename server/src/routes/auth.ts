import express from 'express'
import { changePassword, login, sendOtp, verifyOtp } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { loginSchema } from '../validation/auth.validation'
import { changePasswordSchema, sendOtpSchema, verifyOtpSchema } from '../validation/users.validation'
// import { listBlobs } from '../services/blob.service'
const router = express.Router()

// POST /api/auth/login - User login
router.post('/login', validateRequest(loginSchema), login)

// POST /api/auth/send-otp - Send OTP to email
router.post('/send-otp', validateRequest(sendOtpSchema), sendOtp)

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp)

// POST /api/auth/change-password - Change password
router.post('/change-password',authMiddleware, validateRequest(changePasswordSchema), changePassword)



export { router as authRoutes }