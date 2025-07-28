import dotenv from 'dotenv'

// Load environment variables for testing
dotenv.config({ path: '.env.test' })

// Global test utilities
declare global {
  var testUtils: {
    // Add any global test utilities here
  }
}

global.testUtils = {
  // Add any global test utilities here
} 