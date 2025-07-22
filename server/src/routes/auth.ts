import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '../types'
import { getUsersContainer } from '../config/database'
import { authMiddleware, requireAdmin } from '../middleware/auth'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '24h'

// Helper function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Helper function to compare password
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// Helper function to generate JWT token
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// POST /api/auth/register - User registration (Admin only)
router.post('/register', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, name, password, role = 'standard_user', clientId, azureAdId } = req.body

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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      azureAdId: azureAdId || null,
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

// POST /api/auth/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    const usersContainer = getUsersContainer()

    // Find user by email
    const userQuery = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }]
    }

    const { resources: users } = await usersContainer.items.query(userQuery).fetchAll()

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    const user = users[0] as User & { password: string }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Update last login time
    const updatedUser = {
      ...user,
      lastLoginAt: new Date(),
      updatedAt: new Date()
    }

    await usersContainer.item(user.id, user.id).replace(updatedUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser

    // Generate JWT token
    const token = generateToken(updatedUser)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: JWT_EXPIRES_IN
      }
    })
    return
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const usersContainer = getUsersContainer()

    // Get user from database
    const { resource: user } = await usersContainer.item(authenticatedUser.id, authenticatedUser.id).read()

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: userWithoutPassword
    })
    return
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// PUT /api/auth/me - Update current user profile
router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const updateData: Partial<UpdateUserRequest> = req.body
    const usersContainer = getUsersContainer()

    // Only allow updating name and email for own profile
    const allowedFields = ['name', 'email']
    const updateKeys = Object.keys(updateData)
    const hasUnauthorizedFields = updateKeys.some(key => !allowedFields.includes(key))
    
    if (hasUnauthorizedFields) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your name and email'
      })
    }

    // Get current user
    const { resource: currentUser } = await usersContainer.item(authenticatedUser.id, authenticatedUser.id).read()

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
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
          { name: '@userId', value: authenticatedUser.id }
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

    // Update user
    const updatedUser = {
      ...currentUser,
      ...updateData,
      updatedAt: new Date()
    }

    await usersContainer.item(authenticatedUser.id, authenticatedUser.id).replace(updatedUser)

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    })
    return
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// POST /api/auth/change-password - Change password
router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { currentPassword, newPassword } = req.body
    const usersContainer = getUsersContainer()

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      })
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      })
    }

    // Get current user
    const { resource: currentUser } = await usersContainer.item(authenticatedUser.id, authenticatedUser.id).read()

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update user with new password
    const updatedUser = {
      ...currentUser,
      password: hashedNewPassword,
      updatedAt: new Date()
    }

    await usersContainer.item(authenticatedUser.id, authenticatedUser.id).replace(updatedUser)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
    return
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
})

// PUT /api/auth/users/:id - Update user (Admin only)
router.put('/users/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData: Partial<UpdateUserRequest> = req.body
    const usersContainer = getUsersContainer()

    // Get user to update
    const { resource: user } = await usersContainer.item(id, id).read()

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Prevent admin from updating their own role or deactivating themselves
    const authenticatedUser = (req as any).user
    if (authenticatedUser.id === id) {
      if (updateData.role && updateData.role !== 'admin') {
        return res.status(400).json({
          success: false,
          error: 'Cannot change your own role'
        })
      }
      if (updateData.isActive === false) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate your own account'
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

    // Validate role if being updated
    if (updateData.role) {
      if (![UserRole.ADMIN, UserRole.STANDARD_USER, UserRole.CLIENT].includes(updateData.role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        })
      }
    }

    // Validate clientId based on role
    const finalRole = updateData.role || user.role
    const finalClientId = updateData.clientId !== undefined ? updateData.clientId : user.clientId

    // Standard Users must have clientId
    if (finalRole === UserRole.STANDARD_USER && !finalClientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required for Standard Users - they must be assigned to a client'
      })
    }

    // Clients should not have clientId
    if (finalRole === UserRole.CLIENT && finalClientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID should not be provided for CLIENT role - clients are not assigned to other clients'
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


export { router as authRoutes } 