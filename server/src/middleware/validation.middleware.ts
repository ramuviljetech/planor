import { Request, Response, NextFunction } from 'express'
import { Schema } from 'joi'

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true, // Remove fields not in the schema
      allowUnknown: false // Don't allow unknown fields
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      })
      return
    }

    // Replace req.body with validated data
    req.body = value
    next()
  }
}

// Validation middleware for query parameters
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorMessages
      })
      return
    }

    req.query = value
    next()
  }
}

// Validation middleware for URL parameters
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errorMessages
      })
      return
    }

    req.params = value
    next()
  }
} 