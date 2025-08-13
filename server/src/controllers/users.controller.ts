import { Request, Response } from 'express'
import { UserRole, UserStatus, UpdateUserRequest, next } from '../types'
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
import { hashPassword, comparePassword } from '../utils/common'
import { getUsersContainer } from '../config/database'
import { findUserByEmail } from '../entities/auth.entity'
import { CustomError } from '../middleware/errorHandler'

// !Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { id } = req.params

    let targetUserId: string

    if (authenticatedUser.role === 'admin') {
      // Admin can fetch any user by ID (from params)
      if (!id) {
        throw new CustomError('User ID is required for admin access', 400)
      }
      targetUserId = id
    } else {
      // Regular user can only access their own profile
      targetUserId = authenticatedUser.id
    }

    // Get user from database
    const user = await findUserById(targetUserId)

    if (!user) {
      throw new CustomError('User not found ', 404)
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'User profile retrieved successfully',
      statusCode: 200
    })
  } catch (error) {
    next(error)
  }
}

// !Update user profile
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
        error: 'User not found '
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



// *Get users associated with client
// export const getusersAssociatedWithClient = async (req: Request, res: Response) => {
//   try {
//       const authenticatedUser = (req as any).user
//       const clientId = req.params.clientId
//       const usersContainer = getUsersContainer()
//       // const filters: ClientFilters = req.body
//       let query: string;
//       let parameters: any[] = [];

//       if (clientId) {
//           // Get users belonging to the specific client
//            query = 'SELECT * FROM c WHERE c.role = "standard_user" AND c.clientId = @clientId';
//           parameters = [{ name: '@clientId', value: clientId }];
//         } else {
//           // Get all standard users
//           query = 'SELECT * FROM c WHERE c.role = "standard_user"';
//         }

//       const { resources: users } = await usersContainer.items.query({
//           query,
//           parameters
//       }).fetchAll()


//       const withoutPassword = users.map((user) => {
//           const { password, ...userWithoutPassword } = user
//           return userWithoutPassword
//       })

//       return res.json({
//           success: true,
//           data: withoutPassword
//       })
//   } catch (error) {
//       console.error('Get users associated with client error:', error)
//       return res.status(500).json({
//           success: false,
//           error: 'Internal server error'
//       })
//   }
// }

export const getusersAssociatedWithClient = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user;
    const clientId = req.params.clientId;
    const usersContainer = getUsersContainer();

    // Read pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Build base query
    let query = '';
    let parameters: any[] = [];

    if (clientId) {
      query = `
        SELECT * FROM c 
        WHERE c.role = "standard_user" AND c.clientId = @clientId
        OFFSET @offset LIMIT @limit
      `;
      parameters = [
        { name: '@clientId', value: clientId },
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      ];
    } else {
      query = `
        SELECT * FROM c 
        WHERE c.role = "standard_user"
        OFFSET @offset LIMIT @limit
      `;
      parameters = [
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      ];
    }

    // Count total for pagination
    const countQuery = clientId
      ? 'SELECT VALUE COUNT(1) FROM c WHERE c.role = "standard_user" AND c.clientId = @clientId'
      : 'SELECT VALUE COUNT(1) FROM c WHERE c.role = "standard_user"';

    const countParams = clientId ? [{ name: '@clientId', value: clientId }] : [];

    const countResult = await usersContainer.items.query({
      query: countQuery,
      parameters: countParams
    }).fetchAll();

    const total = countResult.resources[0] ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Fetch users
    const { resources: users } = await usersContainer.items.query({
      query,
      parameters
    }).fetchAll();

    // Strip password field
    const withoutPassword = users.map(({ password, ...user }) => user);

    res.status(200).json({
      success: true,
      data: withoutPassword,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error)
  }
};
