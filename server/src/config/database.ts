import { CosmosClient, Database, Container } from '@azure/cosmos'

// Lazy-loaded Cosmos DB Configuration
let cosmosClient: CosmosClient | null = null
let database: Database
let usersContainer: Container
const containerId = 'users'

// Initialize Cosmos DB client
const initializeCosmosClient = () => {
  const endpoint = process.env.COSMOS_DB_ENDPOINT
  const key = process.env.COSMOS_DB_KEY

  if (endpoint && key) {
    cosmosClient = new CosmosClient({
      endpoint,
      key
    })
    console.log('🔧 Cosmos DB client initialized')
  } else {
    console.log('⚠️  Cosmos DB credentials not provided')
  }
}

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    // Initialize Cosmos client first
    initializeCosmosClient()
    
    if (!cosmosClient) {
      console.log('⚠️  Cosmos DB credentials not provided - using mock data for development')
      return
    }

    const databaseId = process.env.COSMOS_DB_NAME || 'planor-portal'

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