import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  User,
  UserRole,
  UserStatus,
  StandardUser,
  CreateStandardUserRequest,
  ApiResponse
} from '../types'
import { 
  findUserByEmail,
  findUserByEmailExcludingId,
  findUserById,
  createUser,
  updateUser as updateUserEntity,
  getStandardUsers as getStandardUsersEntity,
  deleteUser,
  findClientById
} from '../entities/admin.entity'
import { hashPassword } from '../utils/common'
import { sendWelcomeMail, isMailjetConfigured } from '../services/mail.service'
import { 
  createMultipleUsersSchema,   
} from '../validation/admin.validation'
import { getBuildingStatisticsUltraOptimized } from '../entities/building.entity'




// Create new standard user only (Admin only)
// export const registerUser = async (req: Request, res: Response) => {
//   try {
//     const userData: CreateStandardUserRequest = req.body
//     const authenticatedUser = (req as any).user

//     // Validate user data
//     const validationResult = createUserOnlySchema.validate(userData)
//     if (validationResult.error) {
//       return res.status(400).json({
//         success: false,
//         error: 'Validation failed',
//         details: validationResult.error.details.map(detail => detail.message)
//       })
//     }

//     // Check if user with this email already exists
//     const existingUser = await findUserByEmail(userData.email)
//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         error: 'User with this email already exists'
//       })
//     }

//     // Check if clientId is provided and client exists
//     if (!userData.clientId) {
//       return res.status(400).json({
//         success: false,
//         error: 'ClientId is required when creating a standard user'
//       })
//     }

//     // Verify that the client exists
//     const client = await findClientById(userData.clientId)
//     if (!client) {
//       return res.status(404).json({
//         success: false,
//         error: 'Client not found'
//       })
//     }

//     // Generate a random password for the new user
//     const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1'
//     const hashedPassword = await hashPassword(temporaryPassword)

//     // Create new standard user
//     const newUser: CreateStandardUserRequest = {
//       id: uuidv4(),
//       username: userData.username,
//       role: UserRole.STANDARD_USER,
//       contact: userData.contact ?? '', // Ensure contact is always a string
//       email: userData.email,
//       clientId: userData.clientId,
//       status: UserStatus.ACTIVE,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       lastLoginAt: new Date().toISOString(),
//       password: hashedPassword
//     }

//     // Save user to database
//     const createdUser = await createUser(newUser)

//     // Send welcome email if mail service is configured
//     if (isMailjetConfigured()) {
//       try {
//         await sendWelcomeMail({
//           email: userData.email,
//           username: userData.username,
//           clientName: client.name
//         })
//       } catch (emailError) {
//         console.error('Failed to send welcome email:', emailError)
//         // Don't fail the request if email fails
//       }
//     }

//     // Remove password from response
//     const { password: _, ...userWithoutPassword } = createdUser

//     return res.status(201).json({
//       success: true,
//       message: 'Standard user created successfully',
//       data: {
//         user: userWithoutPassword,
//         temporaryPassword: temporaryPassword
//       }
//     })

//   } catch (error) {
//     console.error('User creation error:', error)
//     return res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     })
//   }
// }


export const registerUsers = async (req: Request, res: Response) => {
  try {
    const { users, clientId } = req.body;
    const authenticatedUser = (req as any).user;

    // Check if client exists
    const client = await findClientById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found with this details'
      });
    }

    // Check for duplicate emails within the request
    const emails = users.map((user: any) => user.email);
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate emails found in the request'
      });
    }

    // Check for existing users with the same emails
    const existingUsers = await Promise.all(
      emails.map((email: string) => findUserByEmail(email))
    );

    const existingEmails = existingUsers
      .filter((user: any) => user !== null)
      .map((user: any) => user!.email);

    if (existingEmails.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Some users already exist',
        details: `Users with these emails already exist: ${existingEmails.join(', ')}`
      });
    }

    // Create all users
    const createdUsers = [];
    const temporaryPasswords = [];

    for (const userData of users) {
      const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1';
      const hashedPassword = await hashPassword(temporaryPassword);

      const newUser: CreateStandardUserRequest = {
        id: uuidv4(),
        username: userData.username,
        role: UserRole.STANDARD_USER,
        contact: userData.contact ,
        email: userData.email,
        clientId: clientId,
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        password: hashedPassword
      };

      const createdUser = await createUser(newUser);
      const { password: _, ...userWithoutPassword } = createdUser;
      
      createdUsers.push(userWithoutPassword);
      temporaryPasswords.push({
        email: userData.email,
        username: userData.username,
        temporaryPassword
      });
    }

    // Respond immediately
    res.status(201).json({
      success: true,
      message: `${createdUsers.length} users created successfully`,
      data: {
        users: createdUsers,
        temporaryPasswords
      }
    });

    // Send welcome emails asynchronously
    if (isMailjetConfigured()) {
      temporaryPasswords.forEach(({ email, username, temporaryPassword }) => {
        sendWelcomeMail({
          email,
          username,
          clientName: client.name
        }).catch((err) => {
          console.error(`Welcome email failed for ${email}:`, err);
        });
      });
    }

    return;
  } catch (error) {
    console.error('Multiple users creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ?Future Scope: PUT /api/admin/profile/:id - Update user (Admin only)
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
        error: 'User not found '
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

// ?Future Scope:GET /api/admin/standard-users - Get all standard users only
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

// ?Future Scope: DELETE /api/admin/delete-users/:id - Delete standard user
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

// GET /api/admin/maintenance-costs - Get total maintenance costs and individual costs
export const getMaintenanceCosts = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { propertyId, clientId } = req.query

    // Import the building entity functions
    // const { calculateBuildingStatistics } = await import('../entities/building.entity')
    const { getPricelistContainer } = await import('../config/database')

    // Get filters from query parameters
    const filters: { propertyId?: string; clientId?: string } = {}
    if (propertyId) filters.propertyId = propertyId as string
    if (clientId) filters.clientId = clientId as string

    // Calculate building statistics which includes maintenance costs
    const statistics = await getBuildingStatisticsUltraOptimized(filters)
    
    // Calculate total maintenance cost
    const totalMaintenanceCost = Object.values(statistics.totalMaintenanceCost).reduce((sum: number, cost: number) => sum + cost, 0)

    // Get detailed breakdown with additional database queries for more granular data
    const pricelistContainer = getPricelistContainer()
    
    // Get all building IDs for detailed cost breakdown
    const { getBuildingsContainer } = await import('../config/database')
    const buildingsContainer = getBuildingsContainer()
    
    let buildingIdsQuery: {
      query: string;
      parameters: Array<{ name: string; value: string }>;
    } = {
      query: 'SELECT c.id FROM c WHERE c.type = "building"',
      parameters: []
    }

    if (filters.propertyId) {
      buildingIdsQuery = {
        query: 'SELECT c.id FROM c WHERE c.type = "building" AND c.propertyId = @propertyId',
        parameters: [{ name: '@propertyId', value: filters.propertyId }]
      }
    } else if (filters.clientId) {
      buildingIdsQuery = {
        query: 'SELECT c.id FROM c WHERE c.type = "building" AND c.clientId = @clientId',
        parameters: [{ name: '@clientId', value: filters.clientId }]
      }
    }

    const { resources: buildingIds } = await buildingsContainer.items.query(buildingIdsQuery).fetchAll()
    const buildingIdList = buildingIds.map(b => b.id)

    // Detailed cost breakdown with database aggregation
    let detailedCosts = {
      doors: { total: 0, count: 0 },
      floors: { total: 0, count: 0 },
      windows: { total: 0, count: 0 },
      walls: { total: 0, count: 0 },
      roofs: { total: 0, count: 0 },
      areas: { total: 0, count: 0 }
    }

    if (buildingIdList.length > 0) {
      // Get detailed cost breakdown from building objects
      const buildingsQuery = {
        query: `SELECT c.id, c.buildingObjects FROM c WHERE c.id IN (${buildingIdList.map((_, i) => `@buildingId${i}`).join(',')})`,
        parameters: buildingIdList.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
      }

      try {
        const { resources: buildingsWithObjects } = await buildingsContainer.items.query(buildingsQuery).fetchAll()
        
        // Get all price items for maintenance cost calculation
        const { resources: allPriceItems } = await pricelistContainer.items.query({
          query: 'SELECT * FROM c WHERE c.price > 0',
          parameters: []
        }).fetchAll()
        
        // Create a map of price items by type and object for quick lookup
        const priceMap = new Map<string, number>()
        for (const priceItem of allPriceItems) {
          const key = `${priceItem.type}_${priceItem.object}`
          priceMap.set(key, priceItem.price)
        }
        
        // Calculate detailed costs from building objects
        for (const building of buildingsWithObjects) {
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
                          detailedCosts.doors.total += totalPrice
                          detailedCosts.doors.count++
                          break
                        case 'floor':
                          detailedCosts.floors.total += totalPrice
                          detailedCosts.floors.count++
                          break
                        case 'window':
                          detailedCosts.windows.total += totalPrice
                          detailedCosts.windows.count++
                          break
                        case 'wall':
                          detailedCosts.walls.total += totalPrice
                          detailedCosts.walls.count++
                          break
                        case 'roof':
                          detailedCosts.roofs.total += totalPrice
                          detailedCosts.roofs.count++
                          break
                        case 'area':
                          detailedCosts.areas.total += totalPrice
                          detailedCosts.areas.count++
                          break
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error calculating detailed maintenance costs:', error)
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          statusCode: 500
        }
        return res.status(500).json(response)
      }
    }

    return res.json({
      success: true,
      message: 'Maintenance costs calculated successfully',
      data: {
        totalCosts: statistics.totalMaintenanceCost
        // summary: {
        //   totalMaintenanceCost,
        //   // totalBuildings: statistics.totalBuildings,
        //   // totalArea: statistics.totalArea,
        //   // maintenanceUpdates: statistics.maintenanceUpdates
        // },
        // breakdown: {
        //   totalCosts: statistics.totalMaintenanceCost,
        //   // detailedCosts
        // }
        // // filters: {
        //   propertyId: filters.propertyId || null,
        //   clientId: filters.clientId || null
        // }
      }
    })

  } catch (error) {
    console.error('Error getting maintenance costs:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
} 





