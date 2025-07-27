import express from 'express'
import { login } from '../controllers/auth.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { loginSchema } from '../validation/auth.validation'

const router = express.Router()

// POST /api/auth/login - User login
router.post('/login', validateRequest(loginSchema), login)

export { router as authRoutes }