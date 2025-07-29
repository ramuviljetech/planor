import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  User,
  UserRole,
  UserStatus,
  StandardUser,
  CreateStandardUserRequest
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
  createClientOnlySchema, 
  createUserOnlySchema, 
} from '../validation/admin.validation'
import { getUsersContainer } from '../config/database'




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

export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData: CreateStandardUserRequest = req.body;
    const authenticatedUser = (req as any).user;

    // Validate user input
    const validationResult = createUserOnlySchema.validate(userData);
    if (validationResult.error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.details.map((detail) => detail.message)
      });
    }

    if (!userData.clientId) {
      return res.status(400).json({
        success: false,
        error: 'ClientId is required when creating a standard user'
      });
    }

    // Check user and client existence in parallel
    const [existingUser, client] = await Promise.all([
      findUserByEmail(userData.email),
      findClientById(userData.clientId)
    ]);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!1';
    const hashedPassword = await hashPassword(temporaryPassword);

    const newUser: CreateStandardUserRequest = {
      id: uuidv4(),
      username: userData.username,
      role: UserRole.STANDARD_USER,
      contact: userData.contact ?? '',
      email: userData.email,
      clientId: userData.clientId,
      status: UserStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      password: hashedPassword
    };

    const createdUser = await createUser(newUser);
    const { password: _, ...userWithoutPassword } = createdUser;

    // Respond immediately
    res.status(201).json({
      success: true,
      message: 'Standard user created successfully',
      data: {
        user: userWithoutPassword,
        temporaryPassword
      }
    });

    // Send welcome email asynchronously
    if (isMailjetConfigured()) {
      sendWelcomeMail({
        email: userData.email,
        username: userData.username,
        clientName: client.name
      }).catch((err) => {
        console.error(`Welcome email failed for ${userData.email}:`, err);
      });
    }

    return; // ✅ Ensure the function always returns
  } catch (error) {
    console.error('User creation error:', error);
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





