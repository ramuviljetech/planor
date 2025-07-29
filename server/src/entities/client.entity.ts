import { getUsersContainer } from "../config/database"
import { Client, CreateClientRequest, UserRole, UserStatus } from "../types"
import { v4 as uuidv4 } from 'uuid'









export const findClientByEmail = async (email: string): Promise<Client | null> => {
    try {
      const usersContainer = getUsersContainer()
      const query = {
        query: 'SELECT * FROM c WHERE c.primaryContactEmail = @email AND c.role = "client"',
        parameters: [{ name: '@email', value: email }]
      }
  
      const { resources: clients } = await usersContainer.items.query(query).fetchAll()
      return clients.length > 0 ? clients[0] : null
    } catch (error) {
      console.error('Error finding client by email:', error)
      throw error
    }
  }


  // Create new client
export const createClient = async (clientData: CreateClientRequest, adminId: string): Promise<Client> => {
    try {
      const usersContainer = getUsersContainer()
      const newClient: CreateClientRequest = {
        id: uuidv4(), // Using organization number as ID
        role: UserRole.CLIENT,
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


  