import { User, UpdateUserRequest } from '../types'
import { getUsersContainer, getOtpContainer } from '../config/database'

// Find user by ID
export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: user } = await usersContainer.item(id, id).read()
    return user || null
  } catch (error) {
    console.error('Error finding user by ID:', error)
    throw error
  }
}

// Find user by email excluding specific user ID
export const findUserByEmailExcludingId = async (email: string, userId: string): Promise<User | null> => {
  try {
    const usersContainer = getUsersContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email AND c.id != @userId',
      parameters: [
        { name: '@email', value: email },
        { name: '@userId', value: userId }
      ]
    }

    const { resources: users } = await usersContainer.items.query(query).fetchAll()
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error('Error finding user by email excluding ID:', error)
    throw error
  }
}

// Update user
export const updateUser = async (id: string, userData: Partial<UpdateUserRequest>): Promise<User> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: user } = await usersContainer.item(id, id).read()
    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    }

    const { resource: result } = await usersContainer.item(id, id).replace(updatedUser)
    if (!result) {
      throw new Error('Failed to update user')
    }
    return result
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Create OTP record
export const createOtpRecord = async (otpData: {
  id: string;
  email: string;
  otp: string;
  createdAt: Date;
  used: boolean;
}) => {
  try {
    const otpContainer = getOtpContainer()
    
    const otpRecordWithTtl = {
      ...otpData,
      ttl: Number(process.env.OTP_TTL || 300)
    }
    
    const { resource: result } = await otpContainer.items.create(otpRecordWithTtl)
    if (!result) {
      throw new Error('Failed to create OTP record')
    }
    return result
  } catch (error) {
    console.error('Error creating OTP record:', error)
    throw error
  }
}

// Delete OTP record
export const deleteOtpRecord = async (email: string): Promise<void> => {
  try {
    const otpContainer = getOtpContainer()
    await otpContainer.item(email, email).delete()
  } catch (error) {
    console.error('Error deleting OTP record:', error)
    // Don't throw error as OTP might not exist
  }
}

// Find OTP record by email
export const findOtpByEmail = async (email: string) => {
  try {
    const otpContainer = getOtpContainer()
    const { resource: otpRecord } = await otpContainer.item(email, email).read()
    return otpRecord || null
  } catch (error) {
    console.error('Error finding OTP record:', error)
    return null
  }
}

// Update OTP record
export const updateOtpRecord = async (email: string, otpData: any) => {
  try {
    const otpContainer = getOtpContainer()
    const { resource: result } = await otpContainer.item(email, email).replace(otpData)
    if (!result) {
      throw new Error('Failed to update OTP record')
    }
    return result
  } catch (error) {
    console.error('Error updating OTP record:', error)
    throw error
  }
} 