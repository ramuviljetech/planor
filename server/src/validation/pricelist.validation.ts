import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types'
import Joi from 'joi'
import { CustomError } from '../middleware/errorHandler'

// Valid interval values for pricelist updates
const interval = ['1-year', '2-years', '3-years', '4-years', '5-years', '6-years', '7-years', '8-years', '9-years', '10-years']

export const createPricelistFromBlobSchema = Joi.object({
  buildingId: Joi.string().required(),
  fileUrl: Joi.string().required(),
  // name: Joi.string().required().optional(),
  // isGlobal: Joi.boolean().optional(),
  // isActive: Joi.boolean().optional(),
  // effectiveFrom: Joi.date().optional(),
  // sasToken: Joi.string().optional()
})

// Validation for creating pricelist from blob
export const validateCreatePricelistFromBlob = (req: Request, res: Response, next: NextFunction) => {
  const { buildingId, fileUrl, name } = req.body

  if (!buildingId) {
    const response: ApiResponse = {
      success: false,
      error: 'buildingId is required',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  if (!fileUrl) {
    const response: ApiResponse = {
      success: false,
      error: 'fileUrl is required',
      statusCode: 400
    }
    return res.status(400).json(response)
  }


  // Validate file URL format
  try {
    new URL(fileUrl)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid file URL format',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  // Validate optional fields
  if (req.body.isGlobal !== undefined && typeof req.body.isGlobal !== 'boolean') {
    const response: ApiResponse = {
      success: false,
      error: 'isGlobal must be a boolean',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  if (req.body.isActive !== undefined && typeof req.body.isActive !== 'boolean') {
    const response: ApiResponse = {
      success: false,
      error: 'isActive must be a boolean',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  if (req.body.effectiveFrom) {
    const date = new Date(req.body.effectiveFrom)
    if (isNaN(date.getTime())) {
      const response: ApiResponse = {
        success: false,
        error: 'effectiveFrom must be a valid date',
        statusCode: 400
      }
      return res.status(400).json(response)
    }
  }

  // Validate SAS token if provided
  if (req.body.sasToken !== undefined && typeof req.body.sasToken !== 'string') {
    const response: ApiResponse = {
      success: false,
      error: 'sasToken must be a string',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  return next()
}

// Validation for updating pricelist
// export const validateUpdatePricelist = (req: Request, res: Response, next: NextFunction) => {
//   const { id } = req.params
//   const updateData = req.body


//   const allowedFields = ['price', 'interval']
//   const keys = Object.keys(updateData)

//   // Only allow "price" field to be updated
//   const hasInvalidFields = keys.some((key) => !allowedFields.includes(key))
//   if (hasInvalidFields) {
//     const response: ApiResponse = {
//       success: false,
//       error: 'Only "price" and "interval" fields can be updated',
//       statusCode: 400
//     }
//     return res.status(400).json(response)
//   }
  
//   if (!id) {
//     const response: ApiResponse = {
//       success: false,
//       error: 'Pricelist ID is required',
//       statusCode: 400
//     }
//     return res.status(400).json(response)
//   }
//     if(!updateData.price){
//     const response: ApiResponse = {
//       success: false,
//       error: 'price is required',
//       statusCode: 400
//     }
//     return res.status(400).json(response)
//   }

//   if (typeof updateData.interval !== 'string' || updateData.interval === '' || !interval.includes(updateData.interval)  ) {
//     const response: ApiResponse = {
//       success: false,
//       error: 'interval must be a valid string and must be one of the following: ' + interval.join(', ') ,
//       statusCode: 400
//     }
//     return res.status(400).json(response)
//   }

//   // Validate price
//   if (typeof updateData.price !== 'number' || isNaN(updateData.price)) {
//     const response: ApiResponse = {
//       success: false,
//       error: '"price" must be a valid number',
//       statusCode: 400
//     }
//     return res.status(400).json(response)
//   }

//   return next()
// }


// Validation for query parameters
export const validatePricelistQuery = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, isActive, isGlobal } = req.query

  if (page !== undefined) {
    const pageNum = parseInt(page as string)
    if (isNaN(pageNum) || pageNum < 1) {
      const response: ApiResponse = {
        success: false,
        error: 'page must be a positive integer',
        statusCode: 400
      }
      return res.status(400).json(response)
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string)
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      const response: ApiResponse = {
        success: false,
        error: 'limit must be a positive integer between 1 and 100',
        statusCode: 400
      }
      return res.status(400).json(response)
    }
  }

  if (isActive !== undefined && isActive !== 'true' && isActive !== 'false') {
    const response: ApiResponse = {
      success: false,
      error: 'isActive must be "true" or "false"',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  if (isGlobal !== undefined && isGlobal !== 'true' && isGlobal !== 'false') {
    const response: ApiResponse = {
      success: false,
      error: 'isGlobal must be "true" or "false"',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  return next()
} 

// Validation for bulk update pricelist items
export const validateBulkUpdatePricelist = (req: Request, res: Response, next: NextFunction) => {
  const updates = req.body

  if (!Array.isArray(updates)) {
   throw new CustomError('Updates must be an array', 400)   
    }


  if (updates.length === 0) {
    throw new CustomError('Updates array cannot be empty', 400)
  }

  // Validate each update item
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i]
    
    if (!update.id || typeof update.id !== 'string') {
      throw new CustomError(`Item ${i}: 'id' is required and must be a string`, 400)
    }

    if (!update.object || typeof update.object !== 'string') {
      throw new CustomError(`Item ${i}: 'object' is required and must be a string`, 400)
    }

    if (!update.type || typeof update.type !== 'string') {
      throw new CustomError(`Item ${i}: 'type' is required and must be a string`, 400)
    }

    if (update.price === undefined || update.price === null || typeof update.price !== 'number' || isNaN(update.price)) {
      throw new CustomError(`Item ${i}: 'price' is required and must be a valid number`, 400)
    }

    if (!update.interval || typeof update.interval !== 'string' || !interval.includes(update.interval)) {
      throw new CustomError(`Item ${i}: 'interval' is required and must be one of: ${interval.join(', ')}`, 400)
    }
  }

  return next()
} 