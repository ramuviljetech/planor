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
  findClientByEmail,
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

// Create new client (Admin only) - can create client only or client + users
export const registerClient = async (req: Request, res: Response) => {
  try {
    const clientData: CreateClientRequest = req.body
    const authenticatedUser = (req as any).user

    // Check if user data is provided (can be single user or array of users)
    const hasUserData = clientData.user && (
      (typeof clientData.user === 'object' && !Array.isArray(clientData.user) && clientData.user.username && clientData.user.email) || // Single user
      (Array.isArray(clientData.user) && clientData.user.length > 0 && clientData.user.every(user => user.username && user.email)) // Multiple users
    )

    console.log('Client data received:', JSON.stringify(clientData, null, 2))
    console.log('Has user data:', hasUserData)
    console.log('User data:', clientData.user)

    // Validate based on whether user data is provided
    let validationResult
    if (hasUserData) {
      // Client + User creation: Use combined schema
      console.log('Using createClientAndUserSchema')
      validationResult = createClientAndUserSchema.validate(clientData)
    } else {
      // Client only creation: Use client-only schema
      console.log('Using createClientOnlySchema')
      const { user, ...clientOnlyData } = clientData
      validationResult = createClientOnlySchema.validate(clientOnlyData)
    }
    console.log('Validation result:', validationResult)

    if (validationResult.error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.details.map((detail: any) => detail.message)
      })
    }

    // Check if client with this email already exists
    const existingClient = await findClientByEmail(clientData.primaryContactEmail)
    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: 'Client with this email already exists'
      })
    }

    // Create new client
    const newClient = await createClient(clientData, authenticatedUser.id)
    console.log('Client created successfully')

    // If user data is provided, create user(s) as well
    if (hasUserData) {
      console.log('Creating user(s) for the new client...')
      
      // Normalize user data to array format
      const usersToCreate = Array.isArray(clientData.user) ? clientData.user : [clientData.user]
      
      // Check for duplicate emails among the users to be created
      const userEmails = usersToCreate.map(u => u.email)
      const uniqueEmails = new Set(userEmails)
      if (uniqueEmails.size !== userEmails.length) {
        return res.status(400).json({
          success: false,
          error: 'Duplicate email addresses found among users'
        })
      }

      // Check if any of the users already exist
      for (const userData of usersToCreate) {
        const existingUser = await findUserByEmail(userData.email)
        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: `User with email ${userData.email} already exists`
          })
        }
      }

      // Create all users
      const createdUsers = []
      const temporaryPasswords = []

      for (const userData of usersToCreate) {
        // Generate a random password for each user
        const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'
        const hashedPassword = await hashPassword(temporaryPassword)

        // Create new standard user with the client's ID
        const newUser: CreateStandardUserRequest = {
          id: uuidv4(),
          username: userData.username,
          role: UserRole.STANDARD_USER,
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
        console.log(`User ${userData.username} created successfully`)

        // Send welcome email if mail service is configured
        if (isMailjetConfigured()) {
          try {
            await sendWelcomeMail({
              email: userData.email,
              username: userData.username,
              clientName: newClient.name
            })
          } catch (emailError) {
            console.error(`Failed to send welcome email to ${userData.email}:`, emailError)
            // Don't fail the request if email fails
          }
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = createdUser
        createdUsers.push(userWithoutPassword)
        temporaryPasswords.push({
          email: userData.email,
          username: userData.username,
          temporaryPassword: temporaryPassword
        })
      }

      const message = usersToCreate.length === 1 
        ? 'Client and standard user created successfully'
        : `Client and ${usersToCreate.length} standard users created successfully`

      return res.status(201).json({
        success: true,
        message: message,
        data: {
          client: newClient,
          users: createdUsers,
          temporaryPasswords: temporaryPasswords
        }
      })
    }

    // If no user data provided, return only client
    return res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: {
        client: newClient
      }
    })

  } catch (error) {
    console.error('Client creation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Get clients with filtering and pagination
export const getClients = async (req: Request, res: Response) => {
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
    console.log('Query:', query)
    console.log('Parameters:', parameters)
    const { resources: clients } = await usersContainer.items.query({
      query,
      parameters
    }).fetchAll()
    console.log('Found clients:', clients.length)

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
          console.log(`Client ${client.clientName}: properties=${propertiesCountValue}, filter=${filters.properties}`)
          if (propertiesCountValue !== filters.properties) {
            console.log(`Filtering out client ${client.clientName} due to properties count mismatch`)
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
    console.log('After properties filtering:', filteredClients.length)

    // Apply pagination
    const page = parseInt(filters.page as unknown as string) || 1
    const limit = parseInt(filters.limit as unknown as string) || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedClients = filteredClients.slice(startIndex, endIndex)

    // Calculate pagination metadata
    const totalClients = filteredClients.length
    const totalPages = Math.ceil(totalClients / limit)

    // Get total clients count (all clients, not filtered)
    const totalClientsQuery = {
      query: 'SELECT VALUE COUNT(1) FROM c WHERE c.type = "client"',
      parameters: []
    }
    const { resources: totalClientsCount } = await usersContainer.items.query(totalClientsQuery).fetchAll()
    const totalClientsValue = totalClientsCount[0] || 0

    // Get new clients this month
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    const newClientsThisMonthQuery = {
      query: 'SELECT VALUE COUNT(1) FROM c WHERE c.type = "client" AND c.createdAt >= @startDate AND c.createdAt <= @endDate',
      parameters: [
        { name: '@startDate', value: firstDayOfMonth.toISOString() },
        { name: '@endDate', value: lastDayOfMonth.toISOString() }
      ]
    }
    const { resources: newClientsThisMonthCount } = await usersContainer.items.query(newClientsThisMonthQuery).fetchAll()
    const newClientsThisMonthValue = newClientsThisMonthCount[0] || 0

    return res.json({
      success: true,
      data: {
        clients: paginatedClients,
        statistics: {
          totalClients: totalClientsValue,
          newClientsThisMonth: newClientsThisMonthValue,
          filteredClients: totalClients // Add filtered count for debugging
        },
        pagination: {
          currentPage: page,
          totalPages,
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
