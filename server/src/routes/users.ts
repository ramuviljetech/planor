import express, { Request, Response } from 'express'
import { User, UserRole, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../types'
import { authMiddleware, requireRole, requireAdmin } from '../middleware/auth'

const router = express.Router()

// Mock database - replace with actual database operations
let users: User[] = [
  {
    id: '1',
    email: 'admin@planor.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    clientId: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-15'),
    azureAdId: 'azure-ad-id-1'
  },
  {
    id: '2',
    email: 'user@planor.com',
    name: 'Standard User',
    role: UserRole.STANDARD_USER,
    clientId: null,
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    lastLoginAt: new Date('2024-01-14'),
    azureAdId: 'azure-ad-id-2'
  },
  {
    id: '3',
    email: 'client@example.com',
    name: 'Client User',
    role: UserRole.CLIENT,
    clientId: 'client-1',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    lastLoginAt: new Date('2024-01-13'),
    azureAdId: 'azure-ad-id-3'
  }
]

// GET /api/users - List users (Admin only)
router.get('/', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    // Filter users based on query parameters
    let filteredUsers = users

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (isActive !== undefined) {
      const active = isActive === 'true'
      filteredUsers = filteredUsers.filter(user => user.isActive === active)
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      )
    }

    // Pagination
    const totalUsers = filteredUsers.length
    const paginatedUsers = filteredUsers.slice(offset, offset + limitNum)

    const response: UserListResponse = {
      users: paginatedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum)
      }
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = users.find(u => u.id === id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user has permission to view this user
    const authenticatedUser = (req as any).user
    if (authenticatedUser.role !== UserRole.ADMIN && authenticatedUser.id !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(user)
    return
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// POST /api/users - Create new user (Admin only)
router.post('/', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userData: CreateUserRequest = req.body

    // Validate required fields
    if (!userData.email || !userData.name || !userData.role) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, name, role' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email)
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    // Validate role
    if (!Object.values(UserRole).includes(userData.role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Validate clientId for CLIENT role
    if (userData.role === UserRole.CLIENT && !userData.clientId) {
      return res.status(400).json({ 
        error: 'Client ID is required for CLIENT role' 
      })
    }

    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(), // In real app, use UUID
      email: userData.email,
      name: userData.name,
      role: userData.role,
      clientId: userData.clientId || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      azureAdId: userData.azureAdId || null
    }

    users.push(newUser)

    res.status(201).json(newUser)
    return
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData: UpdateUserRequest = req.body
    const authenticatedUser = (req as any).user

    // Find user to update
    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userToUpdate = users[userIndex]

    // Check permissions
    if (authenticatedUser.role !== UserRole.ADMIN && authenticatedUser.id !== id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Non-admin users can only update their own basic info
    if (authenticatedUser.role !== UserRole.ADMIN) {
      const allowedFields = ['name']
      const updateKeys = Object.keys(updateData)
      const hasUnauthorizedFields = updateKeys.some(key => !allowedFields.includes(key))
      
      if (hasUnauthorizedFields) {
        return res.status(403).json({ 
          error: 'You can only update your name' 
        })
      }
    }

    // Validate email if being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }

      // Check if email already exists (excluding current user)
      const existingUser = users.find(u => u.email === updateData.email && u.id !== id)
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' })
      }
    }

    // Validate role if being updated (Admin only)
    if (updateData.role && authenticatedUser.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can change user roles' })
    }

    if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Validate clientId for CLIENT role
    if (updateData.role === UserRole.CLIENT && !updateData.clientId) {
      return res.status(400).json({ 
        error: 'Client ID is required for CLIENT role' 
      })
    }

    // Update user
    const updatedUser: User = {
      ...userToUpdate,
      ...updateData,
      updatedAt: new Date()
    }

    users[userIndex] = updatedUser

    res.json(updatedUser)
    return
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const authenticatedUser = (req as any).user

    // Prevent admin from deleting themselves
    if (authenticatedUser.id === id) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      })
    }

    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Soft delete - set isActive to false
    users[userIndex] = {
      ...users[userIndex],
      isActive: false,
      updatedAt: new Date()
    }

    res.json({ message: 'User deactivated successfully' })
    return
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// PATCH /api/users/:id/activate - Activate user (Admin only)
router.patch('/:id/activate', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' })
    }

    users[userIndex] = {
      ...users[userIndex],
      isActive: true,
      updatedAt: new Date()
    }

    res.json(users[userIndex])
    return
  } catch (error) {
    console.error('Error activating user:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// GET /api/users/me - Get current user profile
router.get('/me/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const user = users.find(u => u.id === authenticatedUser.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
    return
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// PUT /api/users/me/profile - Update current user profile
router.put('/me/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const updateData: Partial<UpdateUserRequest> = req.body
    const authenticatedUser = (req as any).user

    // Only allow updating name and email for own profile
    const allowedFields = ['name', 'email']
    const updateKeys = Object.keys(updateData)
    const hasUnauthorizedFields = updateKeys.some(key => !allowedFields.includes(key))
    
    if (hasUnauthorizedFields) {
      return res.status(403).json({ 
        error: 'You can only update your name and email' 
      })
    }

    const userIndex = users.findIndex(u => u.id === authenticatedUser.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Validate email if being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }

      // Check if email already exists
      const existingUser = users.find(u => u.email === updateData.email && u.id !== authenticatedUser.id)
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' })
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date()
    }

    res.json(users[userIndex])
    return
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

export default router 