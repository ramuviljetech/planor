import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
    CreateClientRequest,
    UserRole,
    UserStatus,
    CreateStandardUserRequest,
    ClientFilters,
    next
} from '../types'
import {
    findUserByEmail,
    createUser,
} from '../entities/admin.entity'
import { findClientByEmail, createClient, getClientsWithFilters } from '../entities/client.entity'
import { hashPassword } from '../utils/common'
import { sendWelcomeMail, isMailjetConfigured } from '../services/mail.service'
import {
    createClientOnlySchema,
    createClientAndUserSchema
} from '../validation/admin.validation'
import { CustomError } from '../middleware/errorHandler'

// Create new client (Admin only) - can create client only or client + users
export const registerClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientData: CreateClientRequest = req.body;
        const authenticatedUser = (req as any).user;
        let validationResult;

        if (clientData.user) {
            // If `user` is present, use the combined schema
            validationResult = createClientAndUserSchema.validate(clientData);
        } else {
            // Otherwise, use the client-only schema
            const { user, ...clientOnlyData } = clientData;
            validationResult = createClientOnlySchema.validate(clientOnlyData);
        }

        if (validationResult.error) {
            throw new CustomError('Validation failed', 400, validationResult.error.details.map((detail: any) => detail.message))
        }

        // Check if client with this email already exists
        const existingClient = await findClientByEmail(clientData.primaryContactEmail)
        if (existingClient) {
            throw new CustomError('Client with this email already exists', 409)
        }

        // Create new client
        const newClient = await createClient(clientData, authenticatedUser.id)
        if (!clientData.user) {
            res.status(201).json({
                success: true,
                message: 'Client created successfully',
                data: { client: newClient }
            });
        }

        // If user data is provided, create user(s) as well
        if (clientData.user) {

            // Normalize user data to array format
            const usersToCreate = Array.isArray(clientData.user) ? clientData.user : [clientData.user]

            // Check for duplicate emails among the users to be created
            const userEmails = usersToCreate.map(u => u.email)
            const uniqueEmails = new Set(userEmails)
            if (uniqueEmails.size !== userEmails.length) {
                throw new CustomError('Duplicate email addresses found among users', 400)
            }

            // Check if any of the users already exist
            for (const userData of usersToCreate) {
                const existingUser = await findUserByEmail(userData.email)
                if (existingUser) {
                    throw new CustomError(`User with email ${userData.email} already exists`, 409)
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
                        throw new CustomError(`Failed to send welcome email to ${userData.email}:`, 500)
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

            const message = usersToCreate.length === 1
                ? 'Client and standard user created successfully'
                : `Client and ${usersToCreate.length} standard users created successfully`;

            res.status(201).json({
                success: true,
                message,
                data: {
                    client: newClient,
                    users: createdUsers,
                }
            });
        }

        // Fallback return for client-only creation (should not reach here due to early return above)
        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: { client: newClient }
        });
    } catch (error) {
        next(error)
    }
}

// Get clients with filters (Admin only)
export const getClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authenticatedUser = (req as any).user;
        const filters: ClientFilters = req.body;

        if (authenticatedUser.role !== 'admin') {
            throw new CustomError('Access denied. Admin privileges required.', 403)
        }

        // Use the new utility function from client entity
        const result = await getClientsWithFilters(filters);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error)
    }
};




