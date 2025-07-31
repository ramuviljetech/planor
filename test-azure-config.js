/**
 * Simple Azure Storage Configuration Test
 * This script tests your Azure Storage configuration without needing the full server
 */

require('dotenv').config({ path: './server/.env' })

console.log('🔍 Testing Azure Storage Configuration')
console.log('=====================================\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log(`AZURE_STORAGE_ACCOUNT_NAME: ${process.env.AZURE_STORAGE_ACCOUNT_NAME || 'NOT SET'}`)
console.log(`AZURE_STORAGE_AUTH_METHOD: ${process.env.AZURE_STORAGE_AUTH_METHOD || 'NOT SET'}`)
console.log(`AZURE_STORAGE_SAS_TOKEN: ${process.env.AZURE_STORAGE_SAS_TOKEN ? 'SET' : 'NOT SET'}`)
console.log(`AZURE_STORAGE_CONTAINER_NAME: ${process.env.AZURE_STORAGE_CONTAINER_NAME || 'NOT SET'}`)
console.log('')

// Test SAS token format
if (process.env.AZURE_STORAGE_SAS_TOKEN) {
  console.log('🔐 SAS Token Analysis:')
  const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN
  
  // Check if it starts with sv=
  if (sasToken.startsWith('sv=')) {
    console.log('✅ SAS Token format looks correct (starts with sv=)')
  } else {
    console.log('❌ SAS Token format incorrect (should start with sv=)')
  }
  
  // Check if it contains required parameters
  const requiredParams = ['sv=', 'st=', 'se=', 'sp=', 'sig=']
  const missingParams = requiredParams.filter(param => !sasToken.includes(param))
  
  if (missingParams.length === 0) {
    console.log('✅ SAS Token contains all required parameters')
  } else {
    console.log(`❌ SAS Token missing parameters: ${missingParams.join(', ')}`)
  }
  
  console.log('')
}

// Test URL parsing
console.log('🔗 Testing URL Parsing:')
const testUrl = 'https://planorappfiles.blob.core.windows.net/planorobjectfiles/Files/Areaschedule.csv'
try {
  const url = new URL(testUrl)
  const pathParts = url.pathname.split('/').filter(part => part.length > 0)
  
  if (pathParts.length >= 2) {
    const containerName = pathParts[0]
    const blobName = pathParts.slice(1).join('/')
    
    console.log(`✅ URL: ${testUrl}`)
    console.log(`   Container: ${containerName}`)
    console.log(`   Blob: ${blobName}`)
  } else {
    console.log(`❌ Invalid URL format: ${testUrl}`)
  }
} catch (error) {
  console.log(`❌ URL parsing failed: ${error.message}`)
}

console.log('')
console.log('🎯 Next Steps:')
console.log('1. If environment variables are NOT SET, create/update your .env file')
console.log('2. If SAS token is NOT SET, generate a new SAS token from Azure Portal')
console.log('3. If SAS token format is incorrect, check the token generation')
console.log('4. Test the API endpoint: curl http://localhost:3001/api/pricelist/test-azure-storage') 