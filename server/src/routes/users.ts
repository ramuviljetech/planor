import express, { Request, Response } from 'express'
import { User, UserRole, UserStatus, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../types'
import { authMiddleware} from '../middleware/auth'
import { getUsersContainer, getOtpContainer } from '../config/database'
import { sendMail } from '../services/mail.service';
import { generateNumericOTP } from '../utils/otp';

const router = express.Router()

// GET /api/users/me/auth - Get current user profile (auth version)
router.get('/profile/:id?', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { id } = req.params
    const usersContainer = getUsersContainer()

    let targetUserId: string

    if (authenticatedUser.role === 'admin') {
      // Admin can fetch any user by ID (from params)
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required for admin access'
        });
      }
      targetUserId = id
    } else {
      // Regular user can only access their own profile
      targetUserId = authenticatedUser.id
    }

    // Get user from database
    const { resource: user } = await usersContainer.item(targetUserId, targetUserId).read()

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found '
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

// PUT /api/users/me/auth - Update current user profile (auth version)
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const updateData: Partial<UpdateUserRequest> = req.body
    const usersContainer = getUsersContainer()

    // Only allow updating name, email, and status for own profile
    const allowedFields = ['name', 'email', 'status']
    const updateKeys = Object.keys(updateData)
    const hasUnauthorizedFields = updateKeys.some(key => !allowedFields.includes(key))

    if (authenticatedUser.role === UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update the profile'
      })
    }

    if (updateData.status && !Object.values(UserStatus).includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value. Allowed values are active, deactive'
      });
    }

    if (hasUnauthorizedFields) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your name, email, and status'
      })
    }
    if (updateData.status === UserStatus.BLOCK) {
      return res.status(403).json({
        success: false,
        error: 'You cannot block your own account'
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

// POST /api/users/change-password - Change password
// router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const authenticatedUser = (req as any).user
//     const { currentPassword, newPassword } = req.body
//     const usersContainer = getUsersContainer()

//     // Validate required fields
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         error: 'Current password and new password are required'
//       })
//     }

//     // Validate new password strength
//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         success: false,
//         error: 'New password must be at least 8 characters long'
//       })
//     }

//     // Get current user
//     const { resource: currentUser } = await usersContainer.item(authenticatedUser.id, authenticatedUser.id).read()

//     if (!currentUser) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       })
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password)
//     if (!isCurrentPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         error: 'Current password is incorrect'
//       })
//     }

//     // Hash new password
//     const hashedNewPassword = await hashPassword(newPassword)

//     // Update user with new password
//     const updatedUser = {
//       ...currentUser,
//       password: hashedNewPassword,
//       updatedAt: new Date()
//     }

//     await usersContainer.item(authenticatedUser.id, authenticatedUser.id).replace(updatedUser)

//     res.json({
//       success: true,
//       message: 'Password changed successfully'
//     })
//     return
//   } catch (error) {
//     console.error('Change password error:', error)
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     })
//     return
//   }
// })

// POST /api/users/send-otp - Send OTP to email
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Generate OTP
    const otp = generateNumericOTP()
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in database
    const otpContainer = getOtpContainer()
    const otpData = {
      id: email, // Use email as ID for easy lookup
      email: email,
      otp: otp,
      expiresAt: expiresAt,
      createdAt: new Date(),
      used: false
    }

    // Check if OTP already exists for this email and delete it
    try {
      await otpContainer.item(email, email).delete()
    } catch (error) {
      // OTP doesn't exist, which is fine
      console.log("OTP doesn't exist, which is fine");
      console.log(error);
    
    }

    // Create new OTP record
    await otpContainer.items.create(otpData)

    // Send OTP via email
    await sendMail({
      otp: otp,
      email: email
    })

    res.json({
      success: true,
      message: 'OTP sent successfully to your email'
    })
    return
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please try again.'
    })
    return
  }
})

// POST /api/users/verify-otp - Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Get OTP from database
    const otpContainer = getOtpContainer()
    
    try {
      const { resource: otpRecord } = await otpContainer.item(email, email).read()
      
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          error: 'OTP not found. Please request a new OTP.'
        })
      }

      // Check if OTP is expired
      if (new Date() > new Date(otpRecord.expiresAt)) {
        // Delete expired OTP
        await otpContainer.item(email, email).delete()
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
      await otpContainer.item(email, email).replace(updatedOtpRecord)

      res.json({
        success: true,
        message: 'OTP verified successfully'
      })
      return
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found. Please request a new OTP.'
      })
    }
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    })
    return
  }
})


export { router as usersRoutes }