import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth'
import {
  createPricelistFromBlob,
  getAllPricelistsHandler,
  getPricelistById,
  UpdatePricelistHandler,
  getMaintenanceCostsHandler,
  // bulkUpdatePricelistHandler,
  deletePricelistHandler,
  testAzureStorageHandler,
} from '../controllers/pricelist.controller'
import {
  validateCreatePricelistFromBlob,
  validateBulkUpdatePricelist,
} from '../validation/pricelist.validation'

const router = express.Router()

//* POST /api/pricelist - Create a new pricelist from Azure blob UR
router.post('/', authMiddleware, requireAdmin, validateCreatePricelistFromBlob, createPricelistFromBlob)

//* GET /api/pricelist - Get all pricelists with optional filters
router.get('/', authMiddleware,  getAllPricelistsHandler)


//! GET /api/pricelist/test-azure-storage - Test Azure Storage configuration
router.get('/test-azure-storage', authMiddleware, testAzureStorageHandler)

//* GET /api/pricelist/:id - Get pricelist by ID
router.get('/:id', authMiddleware, getPricelistById)


// *PUT /api/pricelist - Bulk update pricelist
router.put('/', authMiddleware, requireAdmin, validateBulkUpdatePricelist, UpdatePricelistHandler)



// *PUT /api/pricelist/bulk - Bulk update multiple pricelist items 

//*?DELETE /api/pricelist/:id - Delete pricelist
router.delete('/:id', authMiddleware, requireAdmin, deletePricelistHandler)

export { router as pricelistRoutes }
