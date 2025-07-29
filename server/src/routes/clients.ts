import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/validation.middleware'
import { getClientsSchema } from '../validation/admin.validation'
import {
  registerClient,
  getClients,
  getusersAssociatedWithClient
} from '../controllers/client.controller'

const router = express.Router()

// POST /api/clients/register - Create new client (Admin only) - can also create users if user data is provided
router.post('/register', authMiddleware, requireAdmin, registerClient)

// POST /api/clients/get-clients - Get clients with filters (Admin only)
router.post('/get-clients', authMiddleware, requireAdmin, validateRequest(getClientsSchema), getClients)

router.get('/get-users/:clientId?', authMiddleware, requireAdmin, getusersAssociatedWithClient)

export { router as clientRoutes }
