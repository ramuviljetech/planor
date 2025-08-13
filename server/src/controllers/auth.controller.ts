import { Request, Response , NextFunction} from 'express'
import { next, UserStatus,} from '../types'
import { findUserByEmail, updateUserLastLogin } from '../entities/auth.entity'
import { comparePassword, generateTempToken, generateToken, JWT_EXPIRES_IN } from '../utils/common'
import { generateNumericOTP } from '../utils/otp'
import { createOtpRecord, deleteOtpRecord, findOtpByEmail, updateOtpRecord } from '../entities/users.entity'
import { sendMail } from '../services/mail.service'
import { getUsersContainer } from '../config/database'
import { hashPassword } from '../utils/common'
import { CustomError } from '../middleware/errorHandler'


// User login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user || !user.id) {
      throw new CustomError('Invalid email or password', 401)
    }

    // Check if user is blocked (blocked users cannot login)
    if (user.status === UserStatus.BLOCK) {
      throw new CustomError('Account is blocked', 401)
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password || '')
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401)
    }

    // Update last login time
    const updatedUser = await updateUserLastLogin(user.id, new Date())

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser

    // Generate JWT token
    const token = generateToken(updatedUser)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: JWT_EXPIRES_IN
      }
    })
  } catch (error) {
    // console.error('Login error:', error)
    next(error)
  }
} 

// Send OTP to email
export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    // Get user from database
    const user = await findUserByEmail(email)
    if(!user){        
      throw new CustomError('User not found with this email', 400)
    } 
    
    if(user.status === UserStatus.BLOCK){
      throw new CustomError('User is blocked with this email', 400)
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

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email' 
    })
  } catch (error) {
    next(error)
  }
}

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body

    const user = await findUserByEmail(email)
    if(!user){
      throw new CustomError('User not found with this email', 400)
    } 
    // Get OTP from database
    const otpRecord = await findOtpByEmail(email)

    if (!otpRecord) {
      throw new CustomError('OTP not found or expired. Please request a new OTP.', 400)
    }

    // Check if OTP is already used
    if (otpRecord.used) {
      throw new CustomError('OTP has already been used. Please request a new OTP.', 400)
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      throw new CustomError('Invalid OTP. Please check and try again.', 400)
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
    //   throw new CustomError('User not found', 400)
    // } 
    
    // Generate JWT token 
    //!need to generate temp token
    const token = generateTempToken(otpRecord)
    // const tempToken = tempGenerateToken(otpRecord)
  

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token: token,
      // expiresIn: process.env.TEMP_EXPIRES_IN || 5 * 60 * 1000
    })
  } catch (error) {
    next(error)
  }
}


//POST /api/auth/change-password - Change password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const authenticatedUser = (req as any).user
    const { password } = req.body
    const authenticatedUser = (req as any).user;
    const id = authenticatedUser.id;
    
    const usersContainer = getUsersContainer()

    // Validate required fields
    if (!password) {
      throw new CustomError('Password is required', 400)
    }

    // Validate new password strength
    if (password.length < 8) {
      throw new CustomError('New password must be at least 8 characters long', 400)
    }

    // Get current user
    const { resource: currentUser } = await usersContainer.item(id, id).read()

    if (!currentUser) {
      throw new CustomError('User not found', 404)
    }

    // Verify current password
    // const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password)
    // if (!isCurrentPasswordValid) {
    //   throw new CustomError('Current password is incorrect', 401)
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

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
    return
  } catch (error) {
    next(error)
    return
  }
}