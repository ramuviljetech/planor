import { User, UserRole, UserStatus, Client, CreateStandardUserRequest, CreateClientRequest } from '../types'
import { getUsersContainer } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

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
export const createUser = async (user: CreateStandardUserRequest): Promise<User> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: createdUser } = await usersContainer.items.create(user)
    if (!createdUser) {
      throw new Error('Failed to create user')
    }
    return createdUser as unknown as User
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Create new admin user
export const createAdmin = async (adminData: User): Promise<User> => {
  try {
    const usersContainer = getUsersContainer()
    const { resource: createdAdmin } = await usersContainer.items.create(adminData)
    if (!createdAdmin) {
      throw new Error('Failed to create admin')
    }
    return createdAdmin
  } catch (error) {
    console.error('Error creating admin:', error)
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

// Find client by ID
export const findClientById = async (id: string): Promise<Client | null> => {
  try {
    const usersContainer = getUsersContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.id = @id AND c.type = "client"',
      parameters: [{ name: '@id', value: id }]
    }

    const { resources: clients } = await usersContainer.items.query(query).fetchAll()
    return clients.length > 0 ? clients[0] : null
  } catch (error) {
    console.error('Error finding client by ID:', error)
    throw error
  }
}

// Create new client
export const createClient = async (clientData: CreateClientRequest, adminId: string): Promise<Client> => {
  try {
    const usersContainer = getUsersContainer()
    const newClient: CreateClientRequest = {
      id: uuidv4(), // Using organization number as ID
      type: UserRole.CLIENT,
      clientName: clientData.clientName,
      primaryContactName: clientData.primaryContactName,
      primaryContactEmail: clientData.primaryContactEmail,
      primaryContactPhoneNumber: clientData.primaryContactPhoneNumber,
      address: clientData.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationNumber: clientData.organizationNumber,
      industryType: clientData.industryType,
      timezone: clientData.timezone,
      primaryContactRole: clientData.primaryContactRole,
      status: UserStatus.ACTIVE,
      lastLoginAt: new Date().toISOString()
    } as CreateClientRequest

    // Attach adminId as a separate property after type assertion
    const clientToCreate = { ...newClient, adminId }

    const { resource: createdClient } = await usersContainer.items.create(clientToCreate)
    if (!createdClient) {
      throw new Error('Failed to create client')
    }
    // Patch missing properties to satisfy Client type
    return {
      ...createdClient,
      name: createdClient.clientName,
      contactPerson: createdClient.primaryContactName,
      email: createdClient.primaryContactEmail,
      phone: createdClient.primaryContactPhoneNumber,
      isActive: false, // Default to false or set as needed
    } as Client
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
} 



export const createStandardUser = async (userData: CreateStandardUserRequest): Promise<User> => {   
  try {
    const usersContainer = getUsersContainer()
    const newUser: CreateStandardUserRequest = {
      id: uuidv4(),
      username: userData.username,
      type: UserRole.STANDARD_USER,
      contact: userData.contact,
      email: userData.email,
      clientId: userData.clientId,
      status: UserStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      password: userData.password
    }
    const { resource: createdUser } = await usersContainer.items.create(newUser)
    if (!createdUser) {
      throw new Error('Failed to create standard user')
    }
    // Patch missing properties to satisfy User type
    return {
      ...createdUser,
      name: createdUser.username,
      role: createdUser.type,
      contact: createdUser.contact,
    } as unknown as User
  } catch (error) {
    console.error('Error creating standard user:', error)
    throw error
  }
}