import express, { Request, Response } from 'express'
import { User, UserStatus } from '../types'
import { getUsersContainer } from '../config/database'
import { comparePassword, generateToken } from '../utils/common'
import { JWT_EXPIRES_IN } from '../utils/common'

const router = express.Router()

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

    // Check if user is blocked (blocked users cannot login)
    if (user.status === UserStatus.BLOCK) {
      return res.status(401).json({
        success: false,
        error: 'Account is blocked'
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

export { router as authRoutes }