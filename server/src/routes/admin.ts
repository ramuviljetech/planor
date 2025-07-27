import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { UpdateUserRequest, User, UserRole, UserStatus } from '../types'
import { getUsersContainer } from '../config/database'
import { authMiddleware, requireAdmin} from '../middleware/auth'
import { hashPassword } from '../utils/common'

const router = express.Router()



// POST /api/admin/register - User registration (Admin only)
router.post('/register', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, clientId } = req.body

    // Validate required fields
    if (!email || !name || !password) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: email, name, password'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
      return
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      })
      return
    }

    // Validate role - Admin can only create Standard Users and Clients
    if (![UserRole.STANDARD_USER, UserRole.CLIENT].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Admin can only create Standard Users and Clients'
      })
      return
    }

    // Validate clientId for STANDARD_USER role (must be assigned to a client)
    if (role === UserRole.STANDARD_USER && !clientId) {
      res.status(400).json({
        success: false,
        error: 'Client ID is required for Standard Users - they must be assigned to a client'
      })
      return
    }

    // CLIENT role should not have clientId (they are the client)
    if (role === UserRole.CLIENT && clientId) {
      res.status(400).json({
        success: false,
        error: 'Client ID should not be provided for CLIENT role - clients are not assigned to other clients'
      })
      return
    }

    const usersContainer = getUsersContainer()

    // Check if user already exists
    const existingUserQuery = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }]
    }

    const { resources: existingUsers } = await usersContainer.items.query(existingUserQuery).fetchAll()

    if (existingUsers.length > 0) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      })
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      name,
      role,
      clientId: clientId || null,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      password: hashedPassword // Store hashed password
    }

    // Save user to Cosmos DB
    await usersContainer.items.create(newUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userWithoutPassword
      }
    })
    return
  } catch (error) {
    console.error('User creation error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// PUT /api/users/auth/:id - Update user (Admin only) (auth version)
router.put('/profile/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData: Partial<UpdateUserRequest> = req.body
    const usersContainer = getUsersContainer()


    const allowedFields = ['name', 'email', 'status']
    const updateKeys = Object.keys(updateData)
    const hasUnauthorizedFields = updateKeys.some(key => !allowedFields.includes(key))
    if (hasUnauthorizedFields) {
      return res.status(400).json({
        success: false,
        error: 'You can only update name, email, and status'
      })
    }

    if (updateData.status && !Object.values(UserStatus).includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value. Allowed values are active, deactive, or block.'
      });
    }
     
    // Get user to update
    const { resource: user } = await usersContainer.item(id, id).read()

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Prevent admin from blocking themselves
    const authenticatedUser = (req as any).user
    if (authenticatedUser.id === id) {
      if (updateData.status === UserStatus.BLOCK) {
        return res.status(400).json({
          success: false,
          error: 'Cannot block your own account'
        })
      }
    }

    // Validate email if being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        })
      }

      // Check if email already exists (excluding current user)
      const existingUserQuery = {
        query: 'SELECT * FROM c WHERE c.email = @email AND c.id != @userId',
        parameters: [
          { name: '@email', value: updateData.email },
          { name: '@userId', value: id }
        ]
      }

      const { resources: existingUsers } = await usersContainer.items.query(existingUserQuery).fetchAll()

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        })
      }
    }

    // Admin cannot change roles - only status, name, email, and clientId
    if (updateData.role) {
      return res.status(403).json({
        success: false,
        error: 'Admin cannot change  roles'
      })
    }

    // Hash password if being updated
    let hashedPassword = user.password
    if (updateData.password) {
      if (updateData.password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        })
      }
      hashedPassword = await hashPassword(updateData.password)
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updateData,
      password: hashedPassword,
      updatedAt: new Date()
    }

    await usersContainer.item(id, id).replace(updatedUser)

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    })
    return
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// GET /api/users/standard-users - Get all standard users only
router.get('/standard-users', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usersContainer = getUsersContainer()

    // Query to get only standard users
    const standardUsersQuery = {
      query: 'SELECT * FROM c WHERE c.role = @role AND c.status = @status',
      parameters: [
        { name: '@role', value: UserRole.STANDARD_USER },
        { name: '@status', value: UserStatus.ACTIVE }
      ]
    }

    const { resources: standardUsers } = await usersContainer.items.query(standardUsersQuery).fetchAll()

    // Remove passwords from response
    const standardUsersWithoutPasswords = standardUsers.map(({ password, ...user }) => user)

    res.json({
      success: true,
      data: standardUsersWithoutPasswords
    })
    return
  } catch (error) {
    console.error('Get standard users error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// DELETE /api/users/delete-clients/:id - Delete client
router.delete('/delete-clients/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const authenticatedUser = (req as any).user
    const usersContainer = getUsersContainer()

    // Prevent admin from deleting themselves
    if (authenticatedUser.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      })
    }

    // Get user to delete
    const { resource: user } = await usersContainer.item(id, id).read()
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    if (user.role !== UserRole.CLIENT) {
      return res.status(403).json({
        success: false,
        error: 'Only clients can be deleted'
      });
    }
    // Hard delete - permanently remove from database
    await usersContainer.item(id, id).delete()

    res.json({
      success: true,
      message: 'User permanently deleted successfully'
    })
    return
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// DELETE /api/users/delete-users/:id - Delete user
router.delete('/delete-users/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authenticatedUser = (req as any).user;
    const usersContainer = getUsersContainer();

    // Prevent admin from deleting themselves
    if (authenticatedUser.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Get user to delete
    const { resource: user } = await usersContainer.item(id, id).read();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Only allow deletion of STANDARD_USER
    if (user.role !== UserRole.STANDARD_USER) {
      return res.status(403).json({
        success: false,
        error: 'Only standard users can be deleted'
      });
    }

    // Hard delete - permanently remove from database
    await usersContainer.item(id, id).delete();

    res.json({
      success: true,
      message: 'Standard user permanently deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
  return
});
  
export { router as adminRoutes }
