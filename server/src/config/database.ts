import { CosmosClient, Database, Container } from '@azure/cosmos'

// Cosmos DB Configuration
const cosmosClient = process.env.COSMOS_DB_ENDPOINT && process.env.COSMOS_DB_KEY 
  ? new CosmosClient({
      endpoint: process.env.COSMOS_DB_ENDPOINT,
      key: process.env.COSMOS_DB_KEY
    })
  : null

const databaseId = process.env.COSMOS_DB_NAME || 'planor-portal'
const containerId = 'users'

let database: Database
let usersContainer: Container

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    if (!cosmosClient) {
      console.log('⚠️  Cosmos DB credentials not provided - using mock data for development')
      return
    }

    // Create database if it doesn't exist
    const { database: db } = await cosmosClient.databases.createIfNotExists({
      id: databaseId
    })
    database = db

    // Create users container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: '/id'
    })
    usersContainer = container

    console.log('✅ Cosmos DB connected successfully')
  } catch (error) {
    console.error('❌ Failed to connect to Cosmos DB:', error)
    throw error
  }
}

// Get users container
export const getUsersContainer = (): Container => {
  if (!cosmosClient || !usersContainer) {
    throw new Error('Cosmos DB not configured or not initialized. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.')
  }
  return usersContainer
}

// Get database instance
export const getDatabase = (): Database => {
  if (!cosmosClient || !database) {
    throw new Error('Cosmos DB not configured or not initialized. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.')
  }
  return database
}

export default cosmosClient 