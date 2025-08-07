import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
    CreateClientRequest,
    UserRole,
    UserStatus,
    CreateStandardUserRequest,
    ClientFilters,
    ApiResponse
} from '../types'
import {
    findUserByEmail,
    createUser,
    findClientById,
} from '../entities/admin.entity'
import { findClientByEmail, createClient } from '../entities/client.entity'
import { hashPassword } from '../utils/common'
import { sendWelcomeMail, isMailjetConfigured } from '../services/mail.service'
import {
    createClientOnlySchema,
    createClientAndUserSchema
} from '../validation/admin.validation'
import { getUsersContainer, getBuildingsContainer, getPropertiesContainer, getPricelistContainer } from '../config/database'

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
console.log('Users to create:', usersToCreate);

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
        const response: ApiResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            statusCode: 500
          }
        return res.status(500).json(response);
    }
}

// Get clients with filters (Admin only)
//filters: clientName, clientId, status, createdOn, maintananceCost, properties
//!total file uploads pending
export const getClients = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user;
    const filters: ClientFilters = req.body;
    console.log('Filters:', filters);
    if (authenticatedUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    const usersContainer = getUsersContainer();
    const buildingsContainer = getBuildingsContainer();
    const propertiesContainer = getPropertiesContainer();
    const pricelistContainer = getPricelistContainer();

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

    // --- Pagination parameters ---
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    query += ' ORDER BY c.createdAt DESC';
    query += ` OFFSET ${offset} LIMIT ${limit}`;

    // --- Dates for newClientsThisMonth query ---
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // --- Build count query for total filtered clients ---
    let countQuery = 'SELECT VALUE COUNT(1) FROM c WHERE c.role = "client"';
    const countParameters: any[] = [];
    let countParamIdx = 0;

    if (filters.clientName) {
      countParamIdx++;
      countQuery += ` AND CONTAINS(c.clientName, @clientName${countParamIdx})`;
      countParameters.push({ name: `@clientName${countParamIdx}`, value: filters.clientName });
    }

    if (filters.clientId) {
      countParamIdx++;
      countQuery += ` AND c.id = @clientId${countParamIdx}`;
      countParameters.push({ name: `@clientId${countParamIdx}`, value: filters.clientId });
    }

    if (filters.status) {
      countParamIdx++;
      countQuery += ` AND c.status = @status${countParamIdx}`;
      countParameters.push({ name: `@status${countParamIdx}`, value: filters.status });
    }

    if (filters.createdOn) {
      countParamIdx++;
      countQuery += ` AND STARTSWITH(c.createdAt, @createdOn${countParamIdx})`;
      countParameters.push({ name: `@createdOn${countParamIdx}`, value: filters.createdOn });
    }

    if (filters.maintananceCost !== undefined) {
      countParamIdx++;
      countQuery += ` AND c.maintananceCost = @maintananceCost${countParamIdx}`;
      countParameters.push({ name: `@maintananceCost${countParamIdx}`, value: filters.maintananceCost });
    }

    // --- Run parallel queries ---
    const [
      clientsResult,
      totalCountResult,
      propertyCountsResult,
      newClientsThisMonthCountResult
    ] = await Promise.all([
      usersContainer.items.query({ query, parameters }).fetchAll(),

      usersContainer.items.query({ query: countQuery, parameters: countParameters }).fetchAll(),

      propertiesContainer.items.query({
        query: `
          SELECT c.clientId, COUNT(1) AS propertyCount
          FROM c 
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
    const totalFilteredClients = totalCountResult.resources[0] ?? 0;
    const propertyCounts = propertyCountsResult.resources;
    const newClientsThisMonthValue = newClientsThisMonthCountResult.resources[0] ?? 0;

    const propertyCountMap = new Map<string, number>();
    for (const row of propertyCounts) {
      propertyCountMap.set(row.clientId, row.propertyCount);
    }

    // --- Get maintenance costs for each client ---
    const clientMaintenanceCosts = new Map<string, {
      doors: number;
      floors: number;
      windows: number;
      walls: number;
      roofs: number;
      areas: number;
    }>();

    // Get all buildings for the filtered clients
    const clientIdsForMaintenance = clients.map(client => client.id);
    
    if (clientIdsForMaintenance.length > 0) {
      const buildingsQuery = `
        SELECT c.clientId, c.id as buildingId
        FROM c
        WHERE c.type = "building" AND ARRAY_CONTAINS(@clientIds, c.clientId)
      `;

      const buildingsResult = await buildingsContainer.items.query({
        query: buildingsQuery,
        parameters: [{ name: '@clientIds', value: clientIdsForMaintenance }]
      }).fetchAll();

      const buildingIds = buildingsResult.resources.map(b => b.buildingId);
      
      if (buildingIds.length > 0) {
        // Get maintenance costs for all buildings using building objects
        const buildingsQuery = `
          SELECT c.clientId, c.id as buildingId, c.buildingObjects
          FROM c
          WHERE c.id IN (${buildingIds.map((_, i) => `@buildingId${i}`).join(',')})
        `;

        const buildingsResult = await buildingsContainer.items.query({
          query: buildingsQuery,
          parameters: buildingIds.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
        }).fetchAll();

        // Get all price items for maintenance cost calculation
        const { resources: allPriceItems } = await pricelistContainer.items.query({
          query: 'SELECT * FROM c WHERE c.price > 0',
          parameters: []
        }).fetchAll();
        
        // Create a map of price items by type and object for quick lookup
        const priceMap = new Map<string, number>()
        for (const priceItem of allPriceItems) {
          const key = `${priceItem.type}_${priceItem.object}`
          priceMap.set(key, priceItem.price)
        }

        // Group maintenance costs by client
        const clientBuildingMap = new Map<string, string[]>();
        for (const building of buildingsResult.resources) {
          const clientId = building.clientId;
          if (!clientBuildingMap.has(clientId)) {
            clientBuildingMap.set(clientId, []);
          }
          clientBuildingMap.get(clientId)!.push(building.buildingId);
        }

        // Calculate maintenance costs per client from building objects
        for (const [clientId, buildingIds] of clientBuildingMap) {
          let totalMaintenanceCost = {
            doors: 0,
            floors: 0,
            windows: 0,
            walls: 0,
            roofs: 0,
            areas: 0
          };

          // Get buildings for this client
          const clientBuildings = buildingsResult.resources.filter(
            building => building.clientId === clientId
          );

          for (const building of clientBuildings) {
            if (building.buildingObjects) {
              // Iterate through all sections in buildingObjects
              for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
                if (Array.isArray(section)) {
                  for (const obj of section) {
                    // Calculate maintenance costs based on price and count/area
                    const type = obj.type?.toLowerCase()
                    const object = obj.object
                    
                    if (type && object) {
                      const priceKey = `${type}_${object}`
                      const price = priceMap.get(priceKey) || 0
                      
                      if (price > 0) {
                        let totalPrice = 0
                        
                        // Calculate total price based on count or area
                        if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                          totalPrice = price * obj.count
                        } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                          totalPrice = price * obj.area
                        } else {
                          totalPrice = price
                        }
                        
                        switch (type) {
                          case 'door':
                            totalMaintenanceCost.doors += totalPrice
                            break
                          case 'floor':
                            totalMaintenanceCost.floors += totalPrice
                            break
                          case 'window':
                            totalMaintenanceCost.windows += totalPrice
                            break
                          case 'wall':
                            totalMaintenanceCost.walls += totalPrice
                            break
                          case 'roof':
                            totalMaintenanceCost.roofs += totalPrice
                            break
                          case 'area':
                            totalMaintenanceCost.areas += totalPrice
                            break
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          clientMaintenanceCosts.set(clientId, totalMaintenanceCost);
        }
      }
    }

    // --- Filter + transform clients ---
    const processedClients = clients
      .map(client => {
        const propertiesCount = propertyCountMap.get(client.id) ?? 0;

        if (filters.properties !== undefined && propertiesCount !== filters.properties) {
          return null;
        }

        const totalMaintenanceCost = clientMaintenanceCosts.get(client.id) ?? {
          doors: 0,
          floors: 0,
          windows: 0,
          walls: 0,
          roofs: 0,
          areas: 0
        };

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
          updatedAt: client.updatedAt,
          totalMaintenanceCost
        };
      })
      .filter(Boolean);

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
        clients: processedClients,
        statistics: {
          totalClients: totalFilteredClients,
          newClientsThisMonth: newClientsThisMonthValue,
          totalFileUploads: totalFileUploadsValue,
          totalBuildings: filteredBuildingsValue,
          filteredClients: processedClients.length
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFilteredClients / limit),
          itemsPerPage: limit,
          hasNextPage: page * limit < totalFilteredClients,
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








