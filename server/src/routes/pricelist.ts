import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import {
  createPricelistFromBlob,
  getAllPricelistsHandler,
  getPricelistById,
  updatePricelistHandler,
  deletePricelistHandler,
  testAzureStorageHandler
} from '../controllers/pricelist.controller'
import {
  validateCreatePricelistFromBlob,
  validateUpdatePricelist,
  validatePricelistQuery

} from '../validation/pricelist.validation'

const router = express.Router()

//* POST /api/pricelist - Create a new pricelist from Azure blob UR
router.post('/', authMiddleware, requireAdmin, validateCreatePricelistFromBlob, createPricelistFromBlob)
//* GET /api/pricelist - Get all pricelists with optional filters
router.get('/', authMiddleware, validatePricelistQuery, getAllPricelistsHandler)

//! GET /api/pricelist/test-azure-storage - Test Azure Storage configuration
router.get('/test-azure-storage', authMiddleware, testAzureStorageHandler)

//* GET /api/pricelist/:id - Get pricelist by ID
router.get('/:id', authMiddleware, getPricelistById)


// *PUT /api/pricelist/:id - Update pricelist
router.put('/:id', authMiddleware, requireAdmin, validateUpdatePricelist, updatePricelistHandler)

//*?DELETE /api/pricelist/:id - Delete pricelist
router.delete('/:id', authMiddleware, requireAdmin, deletePricelistHandler)

export { router as pricelistRoutes }
