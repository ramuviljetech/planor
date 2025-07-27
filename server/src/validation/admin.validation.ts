import Joi from 'joi'

// User registration validation schema (for admin)
export const registerUserSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    }),
  role: Joi.string()
    .valid('standard_user', 'client')
    .required()
    .messages({
      'any.only': 'Role must be either standard_user or client',
      'any.required': 'Role is required'
    }),
  clientId: Joi.string()
    .optional()
    .allow(null)
    .messages({
      'string.empty': 'Client ID cannot be empty if provided'
    })
})

// Update user validation schema (for admin)
export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'string.empty': 'Name cannot be empty'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty'
    }),
  status: Joi.string()
    .valid('active', 'deactive', 'block')
    .optional()
    .messages({
      'any.only': 'Status must be active, deactive, or block'
    }),
  password: Joi.string()
    .min(8)
    .optional()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password cannot be empty'
    })
})
