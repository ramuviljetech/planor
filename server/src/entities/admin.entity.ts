import { User, UserRole, UserStatus } from '../types'
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

// Create new user
export const createUser = async (user: User): Promise<User> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: createdUser } = await usersContainer.items.create(user)
    if (!createdUser) {
      throw new Error('Failed to create user')
    }
    return createdUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Update user
export const updateUser = async (id: string, userData: User): Promise<User> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: updatedUser } = await usersContainer.item(id, id).replace(userData)
    if (!updatedUser) {
      throw new Error('Failed to update user')
    }
    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Get all standard users
export const getStandardUsers = async (): Promise<User[]> => {
  try {
    const usersContainer = getUsersContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.role = @role AND c.status = @status',
      parameters: [
        { name: '@role', value: UserRole.STANDARD_USER },
        { name: '@status', value: UserStatus.ACTIVE }
      ]
    }

    const { resources: standardUsers } = await usersContainer.items.query(query).fetchAll()
    return standardUsers
  } catch (error) {
    console.error('Error getting standard users:', error)
    throw error
  }
}

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const usersContainer = getUsersContainer()
    await usersContainer.item(id, id).delete()
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
} 