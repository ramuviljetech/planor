import Joi from 'joi'



// Client-only creation validation schema
export const createClientOnlySchema = Joi.object({
  clientName: Joi.string().min(2).max(100).required(),
  organizationNumber: Joi.string().required(),
  industryType: Joi.string().required(),
  address: Joi.string().required(),
  websiteUrl: Joi.string().uri().optional().allow(''),
  // timezone: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'block').required(),
  primaryContactName: Joi.string().min(2).max(100).required(),
  primaryContactEmail: Joi.string().email({ tlds: { allow: false } }).required(),
  // primaryContactRole: Joi.string().optional().allow(''),
  primaryContactPhoneNumber: Joi.number().required(),
  description: Joi.string().optional().allow('')
})

// User-only creation validation schema
// export const createUserOnlySchema = Joi.object({
// //   username: Joi.string()
// //     .min(3)
// //     .max(50)
// //     .required()
// //     .messages({
// //       'string.min': 'Username must be at least 3 characters long',
// //       'string.max': 'Username cannot exceed 50 characters',
// //       'any.required': 'Username is required',
// //       'string.empty': 'Username cannot be empty'
// //     }),
// //   contact: Joi.string()
// //     .required()
// //     .allow('')
// //     .messages({
// //       'string.empty': 'Contact cannot be empty if provided',
// //       'any.required': 'Contact is required'
// //     }),
// //   email: Joi.string()
// //     .email({ tlds: { allow: false } })
// //     .required()
// //     .messages({
// //       'string.email': 'Please provide a valid email address',
// //       'any.required': 'Email is required',
// //       'string.empty': 'Email cannot be empty'
// //     }),
// //   clientId: Joi.string()
// //     .required()
// //     .messages({
// //       'any.required': 'ClientId is required when creating a standard user',
// //       'string.empty': 'ClientId cannot be empty'
// //     })
// // })

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
  // primaryContactRole: Joi.string()
  //   .required()
  //   .messages({
  //     'any.required': 'Primary contact role is required',
  //     'string.empty': 'Primary contact role cannot be empty'
  //   }),
  primaryContactPhoneNumber: Joi.number()
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
  status: Joi.string().valid('active', 'inactive', 'block').required(),
  // User fields (required) - can be single user or array of users
  user: Joi.alternatives().try(
    // Single user object
    Joi.object({
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
      contact: Joi.number()
        .required()
        .messages({
          'any.required': 'Contact is required',
          'number.base': 'Contact must be a number'
        }),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required',
          'string.empty': 'Email cannot be empty'
        })
    }),
    // Array of users
    Joi.array().items(
      Joi.object({
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
        contact: Joi.number()
          .required()
          .messages({
            'any.required': 'Contact is required',
            'number.base': 'Contact must be a number'
          }),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required()
          .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty'
          })
      })
    ).min(1).max(10).messages({
      'array.min': 'At least one user must be provided',
      'array.max': 'Maximum 10 users can be created at once'
    })
  ),
  // Optional fields that might be present
  id: Joi.optional(),
  role: Joi.optional(),
  // status: Joi.optional(),
  createdAt: Joi.optional(),
  updatedAt: Joi.optional(),
  lastLoginAt: Joi.optional(),
  clientId: Joi.optional()
})

// Update user validation schema (for admin)
export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required'
    }),
  status: Joi.string()
    .valid('active', 'deactive', 'block')
    .required()
    .messages({
      'any.only': 'Status must be active, deactive, or block'
    }),
  password: Joi.string()
    .min(8)
      .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is required'
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
  primaryContactPhoneNumber: Joi.number(),
  description: Joi.string().allow(''),

  clientId: Joi.string(), // For user-only creation

  // User object (optional)
  user: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    contact: Joi.number().required(),
    email: Joi.string().email({ tlds: { allow: false } }).required()
  }).optional()
})


export const getClientsSchema = Joi.object({
  clientName: Joi.string().trim().optional(),
  clientId: Joi.string().trim().optional(),
  status: Joi.string().valid('active', 'deactive', 'block').optional(),
  createdOn: Joi.object({
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional()
  }).optional(),
  properties: Joi.number().integer().min(0).optional(),
  maintananceCost: Joi.number().integer().min(0).optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).optional().default(10),
  search: Joi.string().trim().optional()
})

// Multiple users creation validation schema
export const createMultipleUsersSchema = Joi.object({
  clientId: Joi.string()
    .required()
    .messages({
      'any.required': 'ClientId is required when creating multiple users',
      'string.empty': 'ClientId cannot be empty'
    }),
  users: Joi.array().items(
    Joi.object({
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
      contact: Joi.number()
        .required()
        .messages({
          'any.required': 'Contact is required',
          'number.base': 'Contact must be a number'
        }),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required',
          'string.empty': 'Email cannot be empty'
        })
    })
  ).min(1).max(10).required().messages({
    'array.min': 'At least one user must be provided',
    'array.max': 'Maximum 10 users can be created at once',
    'any.required': 'Users array is required'
  })
})

