import Joi from 'joi'



// Client-only creation validation schema
export const createClientOnlySchema = Joi.object({
  clientName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Client name must be at least 2 characters long',
      'string.max': 'Client name cannot exceed 100 characters',
      'any.required': 'Client name is required',
      'string.empty': 'Client name cannot be empty'
    }),
  organizationNumber: Joi.string()
    .required()
    .messages({
      'any.required': 'Organization number is required',
      'string.empty': 'Organization number cannot be empty'
    }),
  industryType: Joi.string()
    .required()
    .messages({
      'any.required': 'Industry type is required',
      'string.empty': 'Industry type cannot be empty'
    }),
  address: Joi.string()
    .required()
    .messages({
      'any.required': 'Address is required',
      'string.empty': 'Address cannot be empty'
    }),
  websiteUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  timezone: Joi.string()
    .required()
    .messages({
      'any.required': 'Timezone is required',
      'string.empty': 'Timezone cannot be empty'
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
  primaryContactEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid primary contact email address',
      'any.required': 'Primary contact email is required',
      'string.empty': 'Primary contact email cannot be empty'
    }),
  primaryContactRole: Joi.string()
    .required()
    .messages({
      'any.required': 'Primary contact role is required',
      'string.empty': 'Primary contact role cannot be empty'
    }),
  primaryContactPhoneNumber: Joi.string()
    .required()
    .messages({
      'any.required': 'Primary contact phone number is required',
      'string.empty': 'Primary contact phone number cannot be empty'
    }),
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.empty': 'Description cannot be empty if provided'
    })
})

// User-only creation validation schema
export const createUserOnlySchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required',
      'string.empty': 'Username cannot be empty'
    }),
  contact: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.empty': 'Contact cannot be empty if provided'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  clientId: Joi.string()
    .required()
    .messages({
      'any.required': 'ClientId is required when creating a standard user',
      'string.empty': 'ClientId cannot be empty'
    })
})

// Combined client + user creation validation schema
export const createClientAndUserSchema = Joi.object({
  // Client fields (all required)
  clientName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Client name must be at least 2 characters long',
      'string.max': 'Client name cannot exceed 100 characters',
      'any.required': 'Client name is required',
      'string.empty': 'Client name cannot be empty'
    }),
  organizationNumber: Joi.string()
    .required()
    .messages({
      'any.required': 'Organization number is required',
      'string.empty': 'Organization number cannot be empty'
    }),
  industryType: Joi.string()
    .required()
    .messages({
      'any.required': 'Industry type is required',
      'string.empty': 'Industry type cannot be empty'
    }),
  address: Joi.string()
    .required()
    .messages({
      'any.required': 'Address is required',
      'string.empty': 'Address cannot be empty'
    }),
  websiteUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  timezone: Joi.string()
    .required()
    .messages({
      'any.required': 'Timezone is required',
      'string.empty': 'Timezone cannot be empty'
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
  primaryContactEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid primary contact email address',
      'any.required': 'Primary contact email is required',
      'string.empty': 'Primary contact email cannot be empty'
    }),
  primaryContactRole: Joi.string()
    .required()
    .messages({
      'any.required': 'Primary contact role is required',
      'string.empty': 'Primary contact role cannot be empty'
    }),
  primaryContactPhoneNumber: Joi.string()
    .required()
    .messages({
      'any.required': 'Primary contact phone number is required',
      'string.empty': 'Primary contact phone number cannot be empty'
    }),
  description: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.empty': 'Description cannot be empty if provided'
    }),
  // User fields (all required)
  user: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 50 characters',
        'any.required': 'Username is required',
        'string.empty': 'Username cannot be empty'
      }),
    contact: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.empty': 'Contact cannot be empty if provided'
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
        'string.empty': 'Email cannot be empty'
      })
  }).required()
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


export const unifiedClientUserSchema = Joi.object({
  // Client fields
  clientName: Joi.string().min(2).max(100),
  organizationNumber: Joi.string(),
  industryType: Joi.string(),
  address: Joi.string(),
  websiteUrl: Joi.string().uri().allow(''),
  timezone: Joi.string(),
  primaryContactName: Joi.string().min(2).max(100),
  primaryContactEmail: Joi.string().email({ tlds: { allow: false } }),
  primaryContactRole: Joi.string(),
  primaryContactPhoneNumber: Joi.string(),
  description: Joi.string().allow(''),

  clientId: Joi.string(), // For user-only creation

  // User object (optional)
  user: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    contact: Joi.string().allow(''),
    email: Joi.string().email({ tlds: { allow: false } }).required()
  }).optional()
})


export const getClientsSchema = Joi.object({
  clientName: Joi.string().trim().optional(),
  clientId: Joi.string().trim().optional(),
  status: Joi.string().valid('active', 'deactive', 'block').optional(),
  createdOn: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Matches "YYYY-MM-DD"
    .optional(),
  properties: Joi.number().integer().min(0).optional(),
  maintananceCost: Joi.number().integer().min(0).optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).optional().default(10)
})

