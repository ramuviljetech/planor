import { CosmosClient, Database, Container } from '@azure/cosmos'

// Lazy-loaded Cosmos DB Configuration
let cosmosClient: CosmosClient | null = null
let database: Database
let usersContainer: Container
let otpContainer: Container
let propertiesContainer: Container
const containerId = 'users'
const otpContainerId = 'otp'
const propertiesContainerId = 'properties'

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

    // Create OTP container if it doesn't exist
    const { container: otpCont } = await database.containers.createIfNotExists({
      id: otpContainerId,
      partitionKey: '/email',
      defaultTtl: 300 // 5 minutes in seconds
    })
    otpContainer = otpCont

    // Create properties container if it doesn't exist
    const { container: propCont } = await database.containers.createIfNotExists({
      id: propertiesContainerId,
      partitionKey: '/id'
    })
    propertiesContainer = propCont

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

// Get OTP container
export const getOtpContainer = (): Container => {
  if (!cosmosClient || !otpContainer) {
    throw new Error('Cosmos DB not configured or not initialized. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.')
  }
  return otpContainer
}

// Get properties container
export const getPropertiesContainer = (): Container => {
  if (!cosmosClient || !propertiesContainer) {
    throw new Error('Cosmos DB not configured or not initialized. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.')
  }
  return propertiesContainer
}

// Get database instance
export const getDatabase = (): Database => {
  if (!cosmosClient || !database) {
    throw new Error('Cosmos DB not configured or not initialized. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.')
  }
  return database
}

export default cosmosClient 