import { Request, Response } from 'express'
import { UserStatus,} from '../types'
import { findUserByEmail, updateUserLastLogin } from '../entities/auth.entity'
import { comparePassword, generateTempToken, generateToken, JWT_EXPIRES_IN } from '../utils/common'
import { generateNumericOTP } from '../utils/otp'
import { createOtpRecord, deleteOtpRecord, findOtpByEmail, updateOtpRecord } from '../entities/users.entity'
import { sendMail } from '../services/mail.service'
import { getUsersContainer } from '../config/database'
import { hashPassword } from '../utils/common'
import { updateUserProfile } from './users.controller'


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

// Send OTP to email
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Get user from database
    const user = await findUserByEmail(email)
    if(!user){        
      return res.status(400).json({
        success: false,
        error: 'User not found with this email'
      })
    } 
    
    if(user.status === UserStatus.BLOCK){
      return res.status(400).json({
        success: false,
        error: 'User is blocked with this email'
      })
    }
    // Generate OTP
    const otp = generateNumericOTP()

    // Store OTP in database
    const otpData = {
      id: user.id, // Use email as ID for easy lookup
      email: email,
      otp: otp,
      createdAt: new Date(),
      used: false
    }

    // Check if OTP already exists for this email and delete it
    await deleteOtpRecord(email)

    // Create new OTP record
    await createOtpRecord(otpData)

    // Send OTP via email
    await sendMail({
      otp: otp,
      email: email
    })

    return res.json({
      success: true,
      message: 'OTP sent successfully to your email' 
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please try again.'
    })
  }
}

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body

    const user = await findUserByEmail(email)
    if(!user){
      return res.status(400).json({
        success: false,
        error: 'User not found with this email'
      })
    } 
    // Get OTP from database
    const otpRecord = await findOtpByEmail(email)

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired. Please request a new OTP.'
      })
    }

    // Check if OTP is already used
    if (otpRecord.used) {
      return res.status(400).json({
        success: false,
        error: 'OTP has already been used. Please request a new OTP.'
      })
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please check and try again.'
      })
    }

    // Mark OTP as used
    const updatedOtpRecord = {
      ...otpRecord,
      used: true,
      usedAt: new Date()
    }
    await updateOtpRecord(email, updatedOtpRecord)

    // Get user from database
    // const user = await findUserByEmail(email)
    // if(!user){        
    //   return res.status(400).json({
    //     success: false,
    //     error: 'User not found'
    //   })
    // } 
    
    // Generate JWT token 
    //!need to generate temp token
    const token = generateTempToken(otpRecord)
    // const tempToken = tempGenerateToken(otpRecord)
  

    return res.json({
      success: true,
      message: 'OTP verified successfully',
      token: token,
      // expiresIn: process.env.TEMP_EXPIRES_IN || 5 * 60 * 1000
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    })
  }
}


//POST /api/auth/change-password - Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    // const authenticatedUser = (req as any).user
    const { password } = req.body
    const authenticatedUser = (req as any).user;
    const id = authenticatedUser.id;
    
    const usersContainer = getUsersContainer()

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      })
    }

    // Validate new password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      })
    }

    // Get current user
    const { resource: currentUser } = await usersContainer.item(id, id).read()

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Verify current password
    // const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password)
    // if (!isCurrentPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'Current password is incorrect'
    //   })
    // }

    // Hash new password
    const hashedNewPassword = await hashPassword(password)

    // Update user with new password
    const updatedUser = {
      ...currentUser,
      password: hashedNewPassword,
      updatedAt: new Date()
    }

    await usersContainer.item(id, id).replace(updatedUser)

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
}