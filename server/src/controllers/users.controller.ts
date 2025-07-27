import { Request, Response } from 'express'
import { UserRole, UserStatus, UpdateUserRequest } from '../types'
import { 
  findUserById, 
  findUserByEmailExcludingId, 
  updateUser,
  createOtpRecord,
  deleteOtpRecord,
  findOtpByEmail,
  updateOtpRecord
} from '../entities/users.entity'
import { sendMail } from '../services/mail.service'
import { generateNumericOTP } from '../utils/otp'

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { id } = req.params

    let targetUserId: string

    if (authenticatedUser.role === 'admin') {
      // Admin can fetch any user by ID (from params)
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required for admin access'
        })
      }
      targetUserId = id
    } else {
      // Regular user can only access their own profile
      targetUserId = authenticatedUser.id
    }

    // Get user from database
    const user = await findUserById(targetUserId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return res.json({
      success: true,
      data: userWithoutPassword
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const updateData: Partial<UpdateUserRequest> = req.body

    if (authenticatedUser.role === UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update the profile'
      })
    }

    if (updateData.status === UserStatus.BLOCK) {
      return res.status(403).json({
        success: false,
        error: 'You cannot block your own account'
      })
    }

    // Get current user
    const currentUser = await findUserById(authenticatedUser.id)
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Check if email already exists (excluding current user) if email is being updated
    if (updateData.email) {
      const existingUser = await findUserByEmailExcludingId(updateData.email, authenticatedUser.id)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        })
      }
    }

    // Update user
    const updatedUser = await updateUser(authenticatedUser.id, updateData)

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    })
  } catch (error) {
    console.error('Update profile error:', error)
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

    // Generate OTP
    const otp = generateNumericOTP()
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in database
    const otpData = {
      id: email, // Use email as ID for easy lookup
      email: email,
      otp: otp,
      expiresAt: expiresAt,
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

    // Get OTP from database
    const otpRecord = await findOtpByEmail(email)
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found. Please request a new OTP.'
      })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      // Delete expired OTP
      await deleteOtpRecord(email)
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
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

    return res.json({
      success: true,
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    })
  }
} 