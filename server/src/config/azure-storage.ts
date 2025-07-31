import { BlobServiceClient, StorageSharedKeyCredential, AnonymousCredential } from '@azure/storage-blob'

/**
 * Azure Storage Configuration
 * 
 * This module handles Azure Storage Blob SDK configuration using environment variables.
 * Supports multiple authentication methods and configuration options.
 */

export interface AzureStorageConfig {
  // Authentication
  connectionString?: string
  accountName?: string
  accountKey?: string
  sasToken?: string
  sasUrl?: string
  authMethod: 'connection_string' | 'account_key' | 'sas_token' | 'sas_url' | 'managed_identity' | 'anonymous'
  
  // Container Configuration
  containerName: string
  pricelistContainer: string
  
  // Performance Settings
  maxRetries: number
  retryDelay: number
  requestTimeout: number
  operationTimeout: number
  concurrentRequests: number
  chunkSize: number
  
  // Security Settings
  enableHttps: boolean
  enableEncryption: boolean
  
  // Logging and Monitoring
  logLevel: string
  enableLogging: boolean
  enableMetrics: boolean
  enableAnalytics: boolean
}

/**
 * Get Azure Storage configuration from environment variables
 */
export const getAzureStorageConfig = (): AzureStorageConfig => {
  return {
    // Authentication
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    sasToken: process.env.AZURE_STORAGE_SAS_TOKEN,
    sasUrl: process.env.AZURE_STORAGE_SAS_URL,
    authMethod: (process.env.AZURE_STORAGE_AUTH_METHOD as any) || 'connection_string',
    
    // Container Configuration
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'planorobjectfiles',
    pricelistContainer: process.env.AZURE_STORAGE_PRICELIST_CONTAINER || 'pricelist-files',
    
    // Performance Settings
    maxRetries: parseInt(process.env.AZURE_STORAGE_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.AZURE_STORAGE_RETRY_DELAY || '1000'),
    requestTimeout: parseInt(process.env.AZURE_STORAGE_REQUEST_TIMEOUT || '30000'),
    operationTimeout: parseInt(process.env.AZURE_STORAGE_OPERATION_TIMEOUT || '60000'),
    concurrentRequests: parseInt(process.env.AZURE_STORAGE_CONCURRENT_REQUESTS || '10'),
    chunkSize: parseInt(process.env.AZURE_STORAGE_CHUNK_SIZE || '4194304'), // 4MB
    
    // Security Settings
    enableHttps: process.env.AZURE_STORAGE_ENABLE_HTTPS !== 'false',
    enableEncryption: process.env.AZURE_STORAGE_ENABLE_ENCRYPTION !== 'false',
    
    // Logging and Monitoring
    logLevel: process.env.AZURE_STORAGE_LOG_LEVEL || 'info',
    enableLogging: process.env.AZURE_STORAGE_ENABLE_LOGGING !== 'false',
    enableMetrics: process.env.AZURE_STORAGE_ENABLE_METRICS !== 'false',
    enableAnalytics: process.env.AZURE_STORAGE_ENABLE_ANALYTICS !== 'false'
  }
}

/**
 * Create BlobServiceClient based on configuration
 */
export const createBlobServiceClient = (): BlobServiceClient => {
  const config = getAzureStorageConfig()
  
  // Validate configuration
  if (!isAzureStorageConfigured()) {
    throw new Error('Azure Storage is not properly configured. Please check your environment variables.')
  }
  
  let client: BlobServiceClient
  
  switch (config.authMethod) {
    case 'connection_string':
      if (!config.connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is required for connection_string authentication')
      }
      client = new BlobServiceClient(config.connectionString)
      break
      
    case 'account_key':
      if (!config.accountName || !config.accountKey) {
        throw new Error('AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY are required for account_key authentication')
      }
      const credential = new StorageSharedKeyCredential(config.accountName, config.accountKey)
      client = new BlobServiceClient(`https://${config.accountName}.blob.core.windows.net`, credential)
      break
      
    case 'sas_token':
      if (!config.accountName || !config.sasToken) {
        throw new Error('AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_SAS_TOKEN are required for sas_token authentication')
      }
      const sasUrl = `https://${config.accountName}.blob.core.windows.net?${config.sasToken}`
      client = new BlobServiceClient(sasUrl)
      break
      
    case 'sas_url':
      if (!config.sasUrl) {
        throw new Error('AZURE_STORAGE_SAS_URL is required for sas_url authentication')
      }
      client = new BlobServiceClient(config.sasUrl)
      break
      
    case 'anonymous':
      if (!config.accountName) {
        throw new Error('AZURE_STORAGE_ACCOUNT_NAME is required for anonymous authentication')
      }
      client = new BlobServiceClient(`https://${config.accountName}.blob.core.windows.net`, new AnonymousCredential())
      break
      
    case 'managed_identity':
      // For managed identity, you would use DefaultAzureCredential
      // This requires @azure/identity package
      throw new Error('Managed identity authentication is not yet implemented. Please use connection_string, account_key, or sas_url')
      
    default:
      throw new Error(`Unsupported authentication method: ${config.authMethod}`)
  }
  
  return client
}

/**
 * Check if Azure Storage is configured
 */
export const isAzureStorageConfigured = (): boolean => {
  const config = getAzureStorageConfig()
  
  switch (config.authMethod) {
    case 'connection_string':
      return !!config.connectionString
    case 'account_key':
      return !!(config.accountName && config.accountKey)
    case 'sas_token':
      return !!(config.accountName && config.sasToken)
    case 'sas_url':
      return !!config.sasUrl
    case 'anonymous':
      return !!config.accountName
    case 'managed_identity':
      return true // Managed identity doesn't require explicit configuration
    default:
      return false
  }
}

/**
 * Get container client for pricelist files
//  */
// export const getPricelistContainerClient = () => {
//   const config = getAzureStorageConfig()
//   const blobServiceClient = createBlobServiceClient()
//   return blobServiceClient.getContainerClient(config.pricelistContainer)
// }

// /**
//  * Get container client for general files
//  */
// export const getGeneralContainerClient = () => {
//   const config = getAzureStorageConfig()
//   const blobServiceClient = createBlobServiceClient()
//   return blobServiceClient.getContainerClient(config.containerName)
// }

/**
 * Test Azure Storage connection
 */
export const testAzureStorageConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (!isAzureStorageConfigured()) {
      return { success: false, message: 'Azure Storage is not configured' }
    }
    
    const blobServiceClient = createBlobServiceClient()
    const config = getAzureStorageConfig()
    
    // Test by listing containers
    const containers = blobServiceClient.listContainers()
    let containerCount = 0
    
    for await (const container of containers) {
      containerCount++
      if (containerCount > 5) break // Just test first few containers
    }
    
    return { 
      success: true, 
      message: `Successfully connected to Azure Storage. Found ${containerCount} containers.` 
    }
  } catch (error) {
    console.error('Azure Storage connection test failed:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Get Azure Storage configuration summary (for debugging)
 */
// export const getAzureStorageConfigSummary = (): string => {
//   const config = getAzureStorageConfig()
  
//   return `
// Azure Storage Configuration:
// - Authentication Method: ${config.authMethod}
// - Container Name: ${config.containerName}
// - Pricelist Container: ${config.pricelistContainer}
// - Max Retries: ${config.maxRetries}
// - Request Timeout: ${config.requestTimeout}ms
// - Operation Timeout: ${config.operationTimeout}ms
// - Enable HTTPS: ${config.enableHttps}
// - Enable Encryption: ${config.enableEncryption}
// - Enable Logging: ${config.enableLogging}
// - Log Level: ${config.logLevel}
// - Configured: ${isAzureStorageConfigured()}
//   `.trim()
// } 