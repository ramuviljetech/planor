import { Request, Response } from 'express'
import { UserStatus } from '../types'
import { findUserByEmail, updateUserLastLogin } from '../entities/auth.entity'
import { comparePassword, generateToken, JWT_EXPIRES_IN } from '../utils/common'

// User login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Check if user is blocked (blocked users cannot login)
    if (user.status === UserStatus.BLOCK) {
      return res.status(401).json({
        success: false,
        error: 'Account is blocked'
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password || '')
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Update last login time
    const updatedUser = await updateUserLastLogin(user.id, new Date())

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser

    // Generate JWT token
    const token = generateToken(updatedUser)

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: JWT_EXPIRES_IN
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
} 