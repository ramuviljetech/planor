import { User, UserStatus } from '../types'
import { getUsersContainer } from '../config/database'

// Find user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersContainer = getUsersContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }]
    }

    const { resources: users } = await usersContainer.items.query(query).fetchAll()
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error('Error finding user by email:', error)
    throw error
  }
}

// Update user last login time
export const updateUserLastLogin = async (userId: string, lastLoginAt: Date): Promise<User> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: user } = await usersContainer.item(userId, userId).read()
    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = {
      ...user,
      lastLoginAt,
      updatedAt: new Date()
    }

    const { resource: result } = await usersContainer.item(userId, userId).replace(updatedUser)
    if (!result) {
      throw new Error('Failed to update user')
    }
    return result
  } catch (error) {
    console.error('Error updating user last login:', error)
    throw error
  }
} 