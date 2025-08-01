import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types'
import Joi from 'joi'

export const createPricelistFromBlobSchema = Joi.object({
  buildingId: Joi.string().required(),
  fileUrl: Joi.string().required(),
  name: Joi.string().required().optional(),
  isGlobal: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  effectiveFrom: Joi.date().optional(),
  sasToken: Joi.string().optional()
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
export const validateUpdatePricelist = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const updateData = req.body

  if (!id) {
    const response: ApiResponse = {
      success: false,
      error: 'Pricelist ID is required',
      statusCode: 400
    }
    return res.status(400).json(response)
  }
    if(!updateData.price){
    const response: ApiResponse = {
      success: false,
      error: 'price is required',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  const allowedFields = ['price']
  const keys = Object.keys(updateData)

  // Only allow "price" field to be updated
  const hasInvalidFields = keys.some((key) => !allowedFields.includes(key))
  if (hasInvalidFields) {
    const response: ApiResponse = {
      success: false,
      error: 'Only "price" field can be updated',
      statusCode: 400
    }
    return res.status(400).json(response)
  }
  

  // Validate price
  if (typeof updateData.price !== 'number' || isNaN(updateData.price)) {
    const response: ApiResponse = {
      success: false,
      error: '"price" must be a valid number',
      statusCode: 400
    }
    return res.status(400).json(response)
  }

  return next()
}


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