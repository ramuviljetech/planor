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
import { findClientByEmail, createClient, getClientsWithFilters } from '../entities/client.entity'
import { hashPassword } from '../utils/common'
import { sendWelcomeMail, isMailjetConfigured } from '../services/mail.service'
import {
    createClientOnlySchema,
    createClientAndUserSchema
} from '../validation/admin.validation'

// Create new client (Admin only) - can create client only or client + users
export const registerClient = async (req: Request, res: Response) => {
    try {
      const clientData: CreateClientRequest = req.body;
      const authenticatedUser = (req as any).user;
  
      console.log('Client data received:', JSON.stringify(clientData, null, 2));
      console.log('User data:', clientData.user);
  
      let validationResult;
  
      if (clientData.user) {
        // If `user` is present, use the combined schema
        console.log('Using createClientAndUserSchema');
        validationResult = createClientAndUserSchema.validate(clientData);
      } else {
        // Otherwise, use the client-only schema
        console.log('Using createClientOnlySchema');
        const { user, ...clientOnlyData } = clientData;
        validationResult = createClientOnlySchema.validate(clientOnlyData);
      }
  
      console.log('Validation result:', validationResult);

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
        if (!clientData.user) {
            return res.status(201).json({
                success: true,
                message: 'Client created successfully',
                data: { client: newClient }
            });
        }

        // If user data is provided, create user(s) as well
        if (clientData.user) {
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
                    // temporaryPassword: {
                    //     email: userData.email,
                    //     username: userData.username,
                    //     // temporaryPassword
                    // }
                };
            });

            const results = await Promise.all(userCreationTasks);
            const createdUsers = results.map(r => r.user);
            // const temporaryPasswords = results.map(r => r.temporaryPassword);

            const message = usersToCreate.length === 1
                ? 'Client and standard user created successfully'
                : `Client and ${usersToCreate.length} standard users created successfully`;

            return res.status(201).json({
                success: true,
                message,
                data: {
                    client: newClient,
                    users: createdUsers,
                    // temporaryPasswords
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

    // Use the new utility function from client entity
    const result = await getClientsWithFilters(filters);

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get clients error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};




