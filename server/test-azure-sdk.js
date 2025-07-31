/**
 * Test script for Azure Storage Blob SDK integration
 * 
 * This script tests the blob access functionality using the Azure Storage Blob SDK
 */

const { BlobClient } = require('@azure/storage-blob')

// Test configuration
const testConfig = {
  // Public blob URL (for testing)
  publicBlobUrl: 'https://planorappfiles.blob.core.windows.net/planorobjectfiles/test-prices.json',
  
  // Private blob URL with SAS token
  privateBlobUrl: 'https://planorappfiles.blob.core.windows.net/planorobjectfiles/test-prices.json',
  sasToken: 'sv=2024-11-04&st=2024-01-01T00:00:00Z&se=2024-12-31T23:59:59Z&sp=r&sip=0.0.0.0-255.255.255.255&spr=https&sr=b&sig=WU9TJfgaycwR1Ggn%2FGRWSwP%2FvtF40vPPnnyw2pjTSuU%3D'
}

/**
 * Test public blob access
 */
async function testPublicBlobAccess() {
  console.log('🔍 Testing public blob access...')
  
  try {
    const blobClient = new BlobClient(testConfig.publicBlobUrl)
    const downloadResponse = await blobClient.download()
    
    if (!downloadResponse.readableStreamBody) {
      throw new Error('No readable stream body')
    }
    
    console.log('✅ Public blob access successful')
    console.log(`📊 Content-Type: ${downloadResponse.contentType}`)
    console.log(`📏 Content-Length: ${downloadResponse.contentLength}`)
    
    return true
  } catch (error) {
    console.error('❌ Public blob access failed:', error.message)
    return false
  }
}

/**
 * Test private blob access with SAS token
 */
async function testPrivateBlobAccess() {
  console.log('🔍 Testing private blob access with SAS token...')
  
  try {
    const url = `${testConfig.privateBlobUrl}?${testConfig.sasToken}`
    const blobClient = new BlobClient(url)
    const downloadResponse = await blobClient.download()
    
    if (!downloadResponse.readableStreamBody) {
      throw new Error('No readable stream body')
    }
    
    console.log('✅ Private blob access successful')
    console.log(`📊 Content-Type: ${downloadResponse.contentType}`)
    console.log(`📏 Content-Length: ${downloadResponse.contentLength}`)
    
    return true
  } catch (error) {
    console.error('❌ Private blob access failed:', error.message)
    return false
  }
}

/**
 * Test blob content parsing
 */
async function testBlobContentParsing() {
  console.log('🔍 Testing blob content parsing...')
  
  try {
    const url = `${testConfig.privateBlobUrl}?${testConfig.sasToken}`
    const blobClient = new BlobClient(url)
    const downloadResponse = await blobClient.download()
    
    if (!downloadResponse.readableStreamBody) {
      throw new Error('No readable stream body')
    }
    
    // Convert stream to text
    const chunks = []
    const stream = downloadResponse.readableStreamBody
    
    if (stream && typeof stream.getReader === 'function') {
      const reader = stream.getReader()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
      } finally {
        reader.releaseLock()
      }
    }
    
    const content = new TextDecoder().decode(Buffer.concat(chunks))
    const contentType = downloadResponse.contentType || ''
    
    console.log('✅ Blob content parsing successful')
    console.log(`📄 Content-Type: ${contentType}`)
    console.log(`📝 Content Preview: ${content.substring(0, 100)}...`)
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(content)
      console.log('✅ JSON parsing successful')
      console.log(`📊 Parsed ${Array.isArray(data) ? data.length : 'object'} items`)
    } catch (jsonError) {
      console.log('⚠️ JSON parsing failed, content might be CSV or other format')
    }
    
    return true
  } catch (error) {
    console.error('❌ Blob content parsing failed:', error.message)
    return false
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Azure Storage Blob SDK tests...\n')
  
  const results = {
    publicAccess: await testPublicBlobAccess(),
    privateAccess: await testPrivateBlobAccess(),
    contentParsing: await testBlobContentParsing()
  }
  
  console.log('\n📊 Test Results:')
  console.log(`Public Access: ${results.publicAccess ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Private Access: ${results.privateAccess ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Content Parsing: ${results.contentParsing ? '✅ PASS' : '❌ FAIL'}`)
  
  const allPassed = Object.values(results).every(result => result === true)
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Azure Storage Blob SDK integration is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Please check your configuration and try again.')
  }
  
  return allPassed
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testPublicBlobAccess,
  testPrivateBlobAccess,
  testBlobContentParsing,
  runTests
} 