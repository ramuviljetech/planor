import Joi from 'joi'

// Create property validation schema
export const createPropertySchema = Joi.object({
  propertyName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Property name must be at least 2 characters long',
      'string.max': 'Property name cannot exceed 100 characters',
      'any.required': 'Property name is required',
      'string.empty': 'Property name cannot be empty'
    }),
  propertyCode: Joi.string()
    .min(2)
    .max(20)
    .required()
    .messages({
      'string.min': 'Property code must be at least 2 characters long',
      'string.max': 'Property code cannot exceed 20 characters',
      'any.required': 'Property code is required',
      'string.empty': 'Property code cannot be empty'
    }),
  propertyType: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Property type must be at least 2 characters long',
      'string.max': 'Property type cannot exceed 50 characters',
      'any.required': 'Property type is required',
      'string.empty': 'Property type cannot be empty'
    }),
  address: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address cannot exceed 200 characters',
      'any.required': 'Address is required',
      'string.empty': 'Address cannot be empty'
    }),
  city: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City cannot exceed 50 characters',
      'any.required': 'City is required',
      'string.empty': 'City cannot be empty'
    }),
  primaryContactName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Primary contact name must be at least 2 characters long',
      'string.max': 'Primary contact name cannot exceed 100 characters',
      'any.required': 'Primary contact name is required',
      'string.empty': 'Primary contact name cannot be empty'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  role: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Role must be at least 2 characters long',
      'string.max': 'Role cannot exceed 50 characters',
      'any.required': 'Role is required',
      'string.empty': 'Role cannot be empty'
    }),
  phone: Joi.string()
    .min(10)
    .max(20)
    .required()
    .messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 20 characters',
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number cannot be empty'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  inactive: Joi.boolean()
    .optional()
    .default(false),
  clientId: Joi.string()
    .required()
    .messages({
      'any.required': 'Client ID is required',
      'string.empty': 'Client ID cannot be empty'
    }),
  metadata: Joi.object({
    grossArea: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.base': 'Gross area must be a number',
        'number.positive': 'Gross area must be a positive number'
      })
  }).optional()
})

// Update property validation schema
export const updatePropertySchema = Joi.object({
  propertyName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Property name must be at least 2 characters long',
      'string.max': 'Property name cannot exceed 100 characters',
      'string.empty': 'Property name cannot be empty'
    }),
  propertyCode: Joi.string()
    .min(2)
    .max(20)
    .optional()
    .messages({
      'string.min': 'Property code must be at least 2 characters long',
      'string.max': 'Property code cannot exceed 20 characters',
      'string.empty': 'Property code cannot be empty'
    }),
  propertyType: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Property type must be at least 2 characters long',
      'string.max': 'Property type cannot exceed 50 characters',
      'string.empty': 'Property type cannot be empty'
    }),
  address: Joi.string()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address cannot exceed 200 characters',
      'string.empty': 'Address cannot be empty'
    }),
  city: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City cannot exceed 50 characters',
      'string.empty': 'City cannot be empty'
    }),
  primaryContactName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Primary contact name must be at least 2 characters long',
      'string.max': 'Primary contact name cannot exceed 100 characters',
      'string.empty': 'Primary contact name cannot be empty'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty'
    }),
  role: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Role must be at least 2 characters long',
      'string.max': 'Role cannot exceed 50 characters',
      'string.empty': 'Role cannot be empty'
    }),
  phone: Joi.string()
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 20 characters',
      'string.empty': 'Phone number cannot be empty'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  inactive: Joi.boolean()
    .optional(),
  clientId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Client ID cannot be empty'
    }),
  metadata: Joi.object({
    grossArea: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.base': 'Gross area must be a number',
        'number.positive': 'Gross area must be a positive number'
      })
  }).optional()
}) 