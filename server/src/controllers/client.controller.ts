import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
    CreateClientRequest,
    UserRole,
    UserStatus,
    CreateStandardUserRequest,
    ClientFilters
} from '../types'
import {
    findUserByEmail,
    createUser,
    getStandardUsers 
} from '../entities/admin.entity'
import { findClientByEmail, createClient } from '../entities/client.entity'
import { hashPassword } from '../utils/common'
import { sendWelcomeMail, isMailjetConfigured } from '../services/mail.service'
import {
    createClientOnlySchema,
    createClientAndUserSchema
} from '../validation/admin.validation'
import { getUsersContainer,getBuildingsContainer } from '../config/database'

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
        if (!hasUserData) {
            return res.status(201).json({
                success: true,
                message: 'Client created successfully',
                data: { client: newClient }
            });
        }

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

            // Parallel user creation
            const userCreationTasks = usersToCreate.map(async (userData) => {
                const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1';
                const hashedPassword = await hashPassword(temporaryPassword);

                const newUser: CreateStandardUserRequest = {
                    id: uuidv4(),
                    username: userData.username,
                    role: UserRole.STANDARD_USER,
                    contact: userData.contact ?? '',
                    email: userData.email,
                    clientId: newClient.id,
                    status: UserStatus.ACTIVE,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString(),
                    password: hashedPassword
                };

                const createdUser = await createUser(newUser);

                if (isMailjetConfigured()) {
                    try {
                        await sendWelcomeMail({
                            email: userData.email,
                            username: userData.username,
                            clientName: newClient.name
                        });
                    } catch (emailError) {
                        console.error(`Failed to send welcome email to ${userData.email}:`, emailError);
                    }
                }

                const { password: _, ...userWithoutPassword } = createdUser;
                return {
                    user: userWithoutPassword,
                    temporaryPassword: {
                        email: userData.email,
                        username: userData.username,
                        temporaryPassword
                    }
                };
            });

            const results = await Promise.all(userCreationTasks);
            const createdUsers = results.map(r => r.user);
            const temporaryPasswords = results.map(r => r.temporaryPassword);

            const message = usersToCreate.length === 1
                ? 'Client and standard user created successfully'
                : `Client and ${usersToCreate.length} standard users created successfully`;

            return res.status(201).json({
                success: true,
                message,
                data: {
                    client: newClient,
                    users: createdUsers,
                    temporaryPasswords
                }
            });
        }

        // Fallback return for client-only creation (should not reach here due to early return above)
        return res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: { client: newClient }
        });
    } catch (error) {
        console.error('Client creation error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Get clients with filters (Admin only)
// This function retrieves clients based on various filters and pagination options.

export const getClients = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user;
    const filters: ClientFilters = req.body;

    if (authenticatedUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    const usersContainer = getUsersContainer();
    const buildingsContainer = getBuildingsContainer();

    // --- Build client query with filters ---
    let query = 'SELECT * FROM c WHERE c.role = "client"';
    const parameters: any[] = [];
    let paramIdx = 0;

    if (filters.clientName) {
      paramIdx++;
      query += ` AND CONTAINS(c.clientName, @clientName${paramIdx})`;
      parameters.push({ name: `@clientName${paramIdx}`, value: filters.clientName });
    }

    if (filters.clientId) {
      paramIdx++;
      query += ` AND c.id = @clientId${paramIdx}`;
      parameters.push({ name: `@clientId${paramIdx}`, value: filters.clientId });
    }

    if (filters.status) {
      paramIdx++;
      query += ` AND c.status = @status${paramIdx}`;
      parameters.push({ name: `@status${paramIdx}`, value: filters.status });
    }

    if (filters.createdOn) {
      paramIdx++;
      query += ` AND STARTSWITH(c.createdAt, @createdOn${paramIdx})`;
      parameters.push({ name: `@createdOn${paramIdx}`, value: filters.createdOn });
    }

    if (filters.maintananceCost !== undefined) {
      paramIdx++;
      query += ` AND c.maintananceCost = @maintananceCost${paramIdx}`;
      parameters.push({ name: `@maintananceCost${paramIdx}`, value: filters.maintananceCost });
    }

    query += ' ORDER BY c.createdAt DESC';

    // --- Dates for newClientsThisMonth query ---
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // --- Run parallel queries ---
    const [
      clientsResult,
      propertyCountsResult,
      newClientsThisMonthCountResult
    ] = await Promise.all([
      usersContainer.items.query({ query, parameters }).fetchAll(),

      usersContainer.items.query({
        query: `
          SELECT c.clientId, COUNT(1) AS propertyCount
          FROM c 
          WHERE c.type = "property"
          GROUP BY c.clientId
        `
      }).fetchAll(),

      usersContainer.items.query({
        query: `
          SELECT VALUE COUNT(1)
          FROM c
          WHERE c.role = "client" AND c.createdAt >= @startDate AND c.createdAt <= @endDate
        `,
        parameters: [
          { name: '@startDate', value: start },
          { name: '@endDate', value: end }
        ]
      }).fetchAll()
    ]);

    const clients = clientsResult.resources;
    const propertyCounts = propertyCountsResult.resources;
    const newClientsThisMonthValue = newClientsThisMonthCountResult.resources[0] ?? 0;

    const propertyCountMap = new Map<string, number>();
    for (const row of propertyCounts) {
      propertyCountMap.set(row.clientId, row.propertyCount);
    }

    // --- Filter + transform clients ---
    const processedClients = clients
      .map(client => {
        const propertiesCount = propertyCountMap.get(client.id) ?? 0;

        if (filters.properties !== undefined && propertiesCount !== filters.properties) {
          return null;
        }

        return {
          id: client.id,
          clientName: client.clientName,
          clientId: client.organizationNumber,
          properties: propertiesCount,
          createdOn: client.createdAt,
          status: client.status,
          primaryContactName: client.primaryContactName,
          primaryContactEmail: client.primaryContactEmail,
          address: client.address,
          industryType: client.industryType,
          timezone: client.timezone,
          updatedAt: client.updatedAt
        };
      })
      .filter(Boolean);

    // --- Pagination ---
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = processedClients.slice(startIndex, endIndex);

    // --- Get filtered building count ---
    let filteredBuildingsCountResult: any[] = [0];
    const filteredClientIds = processedClients.map(client => client?.id).filter(Boolean) as string[];

    if (filteredClientIds.length > 0) {
      const buildingsQuery = `
        SELECT VALUE COUNT(1)
        FROM c
        WHERE c.type = "building" AND ARRAY_CONTAINS(@clientIds, c.clientId)
      `;

      const buildingsResult = await buildingsContainer.items.query({
        query: buildingsQuery,
        parameters: [{ name: '@clientIds', value: filteredClientIds }]
      }).fetchAll();

      filteredBuildingsCountResult = buildingsResult.resources;
    } else {
      // No filters — return total buildings count
      const totalResult = await buildingsContainer.items.query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.type = "building"',
        parameters: []
      }).fetchAll();

      filteredBuildingsCountResult = totalResult.resources;
    }

    const filteredBuildingsValue = filteredBuildingsCountResult[0] ?? 0;

    // --- Placeholder: total file uploads (filtered) ---
    const totalFileUploadsValue = 0;

    // --- Return result ---
    return res.json({
      success: true,
      data: {
        clients: paginatedClients,
        statistics: {
          totalClients: processedClients.length,
          newClientsThisMonth: newClientsThisMonthValue,
          totalFileUploads: totalFileUploadsValue,
          totalBuildings: filteredBuildingsValue,
          filteredClients: processedClients.length
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(processedClients.length / limit),
          itemsPerPage: limit,
          hasNextPage: page * limit < processedClients.length,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get clients error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};







