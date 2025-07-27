import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { UpdateUserRequest, User, UserRole, UserStatus } from '../types'
import { 
  findUserByEmail,
  findUserByEmailExcludingId,
  findUserById,
  createUser,
  updateUser as updateUserEntity,
  getStandardUsers as getStandardUsersEntity,
  deleteUser
} from '../entities/admin.entity'
import { hashPassword } from '../utils/common'

// Register new user (Admin only)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, clientId } = req.body

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      })
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
      password: hashedPassword
    }

    // Save user to database
    await createUser(newUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userWithoutPassword
      }
    })
  } catch (error) {
    console.error('User creation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData: Partial<UpdateUserRequest> = req.body
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

// Get all standard users
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

// Delete client
export const deleteClient = async (req: Request, res: Response) => {
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

    if (user.role !== UserRole.CLIENT) {
      return res.status(403).json({
        success: false,
        error: 'Only clients can be deleted'
      })
    }

    // Hard delete - permanently remove from database
    await deleteUser(id)

    return res.json({
      success: true,
      message: 'User permanently deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Delete standard user
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