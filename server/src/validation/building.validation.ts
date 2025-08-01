import Joi from 'joi'

// Create building validation schema
// Note: One building belongs to exactly one property (one-to-one relationship)
export const createBuildingSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Building name must be at least 2 characters long',
      'string.max': 'Building name cannot exceed 100 characters',
      'any.required': 'Building name is required',
      'string.empty': 'Building name cannot be empty'
    }),
  description: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.min': 'Description must be at least 5 characters long',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required',
      'string.empty': 'Description cannot be empty'
    }),
  propertyId: Joi.string()
    .required()
    .messages({
      'any.required': 'Property ID is required (one building belongs to exactly one property)',
      'string.empty': 'Property ID cannot be empty'
    }),
  contactPerson: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Contact person must be at least 2 characters long',
      'string.max': 'Contact person cannot exceed 100 characters',
      'any.required': 'Contact person is required',
      'string.empty': 'Contact person cannot be empty'
    }),
  contactEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Contact email is required',
      'string.empty': 'Contact email cannot be empty'
    }),
  contactPhone: Joi.string()
    .min(10)
    .max(20)
    .required()
    .messages({
      'string.min': 'Contact phone must be at least 10 characters long',
      'string.max': 'Contact phone cannot exceed 20 characters',
      'any.required': 'Contact phone is required',
      'string.empty': 'Contact phone cannot be empty'
    }),
  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid URL for the image'
    }),

  metadata: Joi.object({
    floors: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Floors must be a number',
        'number.integer': 'Floors must be a whole number',
        'number.positive': 'Floors must be a positive number'
      }),
    totalArea: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.base': 'Total area must be a number',
        'number.positive': 'Total area must be a positive number'
      }),
    yearBuilt: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear())
      .optional()
      .messages({
        'number.base': 'Year built must be a number',
        'number.integer': 'Year built must be a whole number',
        'number.min': 'Year built must be at least 1800',
        'number.max': 'Year built cannot be in the future'
      })
  }).optional()
})

// Update building validation schema


export const updateBuildingSchema = Joi.object({
  buildingId: Joi.string()
    .required()
    .messages({
      'any.required': 'Building ID is required',
      'string.empty': 'Building ID cannot be empty'
    }),

  objectIds: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  )
    .required()
    .messages({
      'any.required': 'Object ID(s) are required',
      'string.empty': 'Object ID(s) cannot be empty'
    }),

  maintenanceDate: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'any.required': 'Maintenance date is required',
      'string.empty': 'Maintenance date cannot be empty',
      'string.pattern.base': 'Maintenance date must be in YYYY-MM-DD format'
    }),

  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Building name must be at least 2 characters long',
      'string.max': 'Building name cannot exceed 100 characters',
      'string.empty': 'Building name cannot be empty'
    }),

  description: Joi.string()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Description must be at least 5 characters long',
      'string.max': 'Description cannot exceed 500 characters',
      'string.empty': 'Description cannot be empty'
    }),

  propertyId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Property ID cannot be empty'
    }),

  contactPerson: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Contact person must be at least 2 characters long',
      'string.max': 'Contact person cannot exceed 100 characters',
      'string.empty': 'Contact person cannot be empty'
    }),

  contactEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Contact email cannot be empty'
    }),

  contactPhone: Joi.string()
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.min': 'Contact phone must be at least 10 characters long',
      'string.max': 'Contact phone cannot exceed 20 characters',
      'string.empty': 'Contact phone cannot be empty'
    }),

  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid URL for the image'
    }),

  metadata: Joi.object({
    floors: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Floors must be a number',
        'number.integer': 'Floors must be a whole number',
        'number.positive': 'Floors must be a positive number'
      }),
    totalArea: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.base': 'Total area must be a number',
        'number.positive': 'Total area must be a positive number'
      }),
    yearBuilt: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear())
      .optional()
      .messages({
        'number.base': 'Year built must be a number',
        'number.integer': 'Year built must be a whole number',
        'number.min': 'Year built must be at least 1800',
        'number.max': 'Year built cannot be in the future'
      })
  }).optional()
}).unknown(false);








