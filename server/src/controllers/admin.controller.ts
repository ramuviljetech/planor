import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  CreateClientRequest,
  User,
  UserRole,
  UserStatus,
  StandardUser,
  CreateStandardUserRequest,
  ClientFilters
} from '../types'
import { 
  findUserByEmail,
  findUserByEmailExcludingId,
  findUserById,
  createUser,
  updateUser as updateUserEntity,
  getStandardUsers as getStandardUsersEntity,
  deleteUser,
  findClientById,
  createClient
} from '../entities/admin.entity'
import { hashPassword } from '../utils/common'
import { sendWelcomeMail, isMailjetConfigured } from '../services/mail.service'
import { 
  createClientOnlySchema, 
  createUserOnlySchema, 
  createClientAndUserSchema 
} from '../validation/admin.validation'
import { getUsersContainer } from '../config/database'


// Create new client (Admin only) - can also create standard user if user data is provided
//!not completed
export const createNewUsers = async (req: Request, res: Response) => {
  try {
    const clientData: CreateClientRequest = req.body
    const authenticatedUser = (req as any).user
    

    // Determine the type of request
    const hasClientData = clientData.clientName && clientData.organizationNumber && clientData.industryType && clientData.address && clientData.timezone && clientData.primaryContactName && clientData.primaryContactEmail && clientData.primaryContactRole && clientData.primaryContactPhoneNumber
    const hasUserData = clientData.user && clientData.user.username && clientData.user.email

    // Validate based on request type
    let validationResult
    if (hasClientData && hasUserData) {
      // 1. Client + User creation: First validate client, then validate user
      console.log('Validating client + user creation...')
      validationResult = createClientAndUserSchema.validate(clientData)
    } else if (hasClientData && !hasUserData) { 
      // 2. Client only creation
      console.log('Validating client-only creation...')
      validationResult = createClientOnlySchema.validate(clientData)
    } else if (!hasClientData && hasUserData) {
      // 3. User only creation
      console.log('Validating user-only creation...')
      const userData = {
        username: clientData.user!.username,
        contact: clientData.user!.contact,
        email: clientData.user!.email,
        clientId: clientData.clientId
      }
      validationResult = createUserOnlySchema.validate(userData)
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either client data or user data must be provided'
      })
    }

    if (validationResult.error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.details.map(detail => detail.message)
      })
    }

    // If client + user creation: First create client, then create user
    if (hasClientData && hasUserData) {
      console.log('Creating client first...')
      
      // Check if client with this organization number already exists
      const existingClient = await findClientById(clientData.organizationNumber)
      if (existingClient) {
        return res.status(409).json({
          success: false,
          error: 'Client with this organization number already exists'
        })
      }

      // Create new client
      const newClient = await createClient(clientData, authenticatedUser.id)
      console.log('Client created successfully, now creating user...')

      // Now validate and create user
      const userData = clientData.user!
      
      // Check if user with this email already exists
      const existingUser = await findUserByEmail(userData.email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        })
      }

      // Generate a random password for the new user
      const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'
      const hashedPassword = await hashPassword(temporaryPassword)

      // Create new standard user with the client's ID
      const newUser: CreateStandardUserRequest = {
        id: uuidv4(),
        username: userData.username,
        type: UserRole.STANDARD_USER,
        contact: userData.contact ?? '', // Ensure contact is always a string
        email: userData.email,
        clientId: newClient.id, // Use the newly created client's ID
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        password: hashedPassword
      }

      // Save user to database
      const createdUser = await createUser(newUser)
      console.log('User created successfully')

      // Send welcome email if mail service is configured
      if (isMailjetConfigured()) {
        try {
          await sendWelcomeMail({
            email: userData.email,
            username: userData.username,
            clientName: newClient.name
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't fail the request if email fails
        }
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = createdUser

      return res.status(201).json({
        success: true,
        message: 'Client and standard user created successfully',
        data: {
          client: newClient,
          user: userWithoutPassword,
          temporaryPassword: temporaryPassword
        }
      })
    }

    // If user only creation
    if (!hasClientData && hasUserData) {
      console.log('Creating user for existing client...')
      
      const userData = clientData.user!

      // Check if user with this email already exists
      const existingUser = await findUserByEmail(userData.email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        })
      }

      // Check if clientId is provided and client exists
      if (!clientData.clientId) {
        return res.status(400).json({
          success: false,
          error: 'ClientId is required when creating a standard user'
        })
      }

      // Verify that the client exists
      const client = await findClientById(clientData.clientId)
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        })
      }

      // Generate a random password for the new user
      const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'
      const hashedPassword = await hashPassword(temporaryPassword)

      // Create new standard user with the provided clientId
      const newUser: CreateStandardUserRequest = {
        id: uuidv4(),
        username: userData.username,
        type: UserRole.STANDARD_USER,
        contact: userData.contact ?? '', // Ensure contact is always a string
        email: userData.email,
        clientId: clientData.clientId, // Use the provided clientId
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        password: hashedPassword
      }

      // Save user to database
      const createdUser = await createUser(newUser)

      // Send welcome email if mail service is configured
      if (isMailjetConfigured()) {
        try {
          await sendWelcomeMail({
            email: userData.email,
            username: userData.username,
            clientName: client.name
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't fail the request if email fails
        }
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = createdUser

      return res.status(201).json({
        success: true,
        message: 'Standard user created successfully',
        data: {
          user: userWithoutPassword,
          temporaryPassword: temporaryPassword
        }
      })
    }

    // If client only creation
    if (hasClientData && !hasUserData) {
      console.log('Creating client only...')
      
      // Check if client with this organization number already exists
      const existingClient = await findClientById(clientData.organizationNumber)
      if (existingClient) {
        return res.status(409).json({
          success: false,
          error: 'Client with this organization number already exists'
        })
      }

      // Create new client
      const newClient = await createClient(clientData, authenticatedUser.id)

      return res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: {
          client: newClient
        }
      })
    }

    // If neither client nor user data is provided
    return res.status(400).json({
      success: false,
      error: 'Either client data or user data must be provided'
    })

  } catch (error) {
    console.error('Client creation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData: Partial<StandardUser> = req.body
    const authenticatedUser = (req as any).user

    // Get user to update
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Prevent admin from blocking themselves
    if (authenticatedUser.id === id) {
      if (updateData.status === UserStatus.BLOCK) {
        return res.status(400).json({
          success: false,
          error: 'Cannot block your own account'
        })
      }
    }

    // Check if email already exists (excluding current user) if email is being updated
    if (updateData.email) {
      const existingUser = await findUserByEmailExcludingId(updateData.email, id)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        })
      }
    }

    // Admin cannot change roles
    if (updateData.role) {
      return res.status(403).json({
        success: false,
        error: 'Admin cannot change roles'
      })
    }

    // Hash password if being updated
    let hashedPassword = user.password
    if (updateData.password) {
      hashedPassword = await hashPassword(updateData.password)
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updateData,
      password: hashedPassword,
      updatedAt: new Date()
    }

    await updateUserEntity(id, updatedUser)

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    })
  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Get all standard users
export const getStandardUsers = async (req: Request, res: Response) => {
  try {
    const standardUsers = await getStandardUsersEntity()

    // Remove passwords from response
    const standardUsersWithoutPasswords = standardUsers.map(({ password, ...user }: User) => user)

    return res.json({
      success: true,
      data: standardUsersWithoutPasswords
    })
  } catch (error) {
    console.error('Get standard users error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Delete standard user
export const deleteStandardUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const authenticatedUser = (req as any).user

    // Prevent admin from deleting themselves
    if (authenticatedUser.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      })
    }

    // Get user to delete
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Only allow deletion of STANDARD_USER
    if (user.role !== UserRole.STANDARD_USER) {
      return res.status(403).json({
        success: false,
        error: 'Only standard users can be deleted'
      })
    }

    // Hard delete - permanently remove from database
    await deleteUser(id)

    return res.json({
      success: true,
      message: 'Standard user permanently deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
} 


//!just written need to test
export const getClients  = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const filters: ClientFilters = req.body

    // Validate user permissions
    if (authenticatedUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      })
    }

    const usersContainer = getUsersContainer()
    
    // Build query parameters
    let query = 'SELECT * FROM c WHERE c.type = "client"'
    const parameters: any[] = []
    let parameterIndex = 0

    // Filter by client name (partial match)
    if (filters.clientName) {
      parameterIndex++
      query += ` AND CONTAINS(c.clientName, @clientName${parameterIndex})`
      parameters.push({ name: `@clientName${parameterIndex}`, value: filters.clientName })
    }

    // Filter by client ID (exact match)
    if (filters.clientId) {
      parameterIndex++
      query += ` AND c.id = @clientId${parameterIndex}`
      parameters.push({ name: `@clientId${parameterIndex}`, value: filters.clientId })
    }

    // Filter by status
    if (filters.status) {
      parameterIndex++
      query += ` AND c.status = @status${parameterIndex}`
      parameters.push({ name: `@status${parameterIndex}`, value: filters.status })
    }

    // Filter by createdOn date (match date part only, no range)
    if (filters.createdOn) {
      parameterIndex++
      query += ` AND STARTSWITH(c.createdAt, @createdOn${parameterIndex})`
      parameters.push({ name: `@createdOn${parameterIndex}`, value: filters.createdOn }) // e.g. "2025-08-10"
    }

    // Filter by maintananceCost
    if (filters.maintananceCost) {
      parameterIndex++
      query += ` AND c.maintananceCost = @maintananceCost${parameterIndex}`
      parameters.push({ name: `@maintananceCost${parameterIndex}`, value: filters.maintananceCost })
    }

    // Add ordering
    query += ' ORDER BY c.createdAt DESC'

    // Execute query
    const { resources: clients } = await usersContainer.items.query({
      query,
      parameters
    }).fetchAll()

    // Process clients to add properties count and format response
    const processedClients = await Promise.all(
      clients.map(async (client) => {
        // Get properties count for this client
        const propertiesQuery = {
          query: 'SELECT VALUE COUNT(1) FROM c WHERE c.type = "property" AND c.clientId = @clientId',
          parameters: [{ name: '@clientId', value: client.id }]
        }
        
        const { resources: propertiesCount } = await usersContainer.items.query(propertiesQuery).fetchAll()
        const propertiesCountValue = propertiesCount[0] || 0

        // Filter by properties count if specified (exact number)
        if (filters.properties !== undefined) {
          if (propertiesCountValue !== filters.properties) {
            return null
          }
        }

        return {
          id: client.id,
          clientName: client.clientName,
          clientId: client.organizationNumber,
          properties: propertiesCountValue,
          createdOn: client.createdAt,
          status: client.status,
          primaryContactName: client.primaryContactName,
          primaryContactEmail: client.primaryContactEmail,
          address: client.address,
          industryType: client.industryType,
          timezone: client.timezone,
          updatedAt: client.updatedAt
        }
      })
    )

    // Remove null values (filtered out by properties count)
    const filteredClients = processedClients.filter(client => client !== null)

    // Apply pagination
    const page = parseInt(filters.page as unknown as string) || 1
    const limit = parseInt(filters.limit as unknown as string) || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedClients = filteredClients.slice(startIndex, endIndex)

    // Calculate pagination metadata
    const totalClients = filteredClients.length
    const totalPages = Math.ceil(totalClients / limit)

    return res.json({
      success: true,
      data: {
        clients: paginatedClients,
        pagination: {
          currentPage: page,
          totalPages,
          totalClients,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Get clients error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
