const { CosmosClient } = require('@azure/cosmos');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Cosmos DB Configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT || '',
  key: process.env.COSMOS_DB_KEY || ''
});

const databaseId = process.env.COSMOS_DB_NAME || 'planor-portal';
const containerId = 'users';

async function createAdminUser() {
  try {
    // Check if Cosmos DB credentials are provided
    if (!process.env.COSMOS_DB_ENDPOINT || !process.env.COSMOS_DB_KEY) {
      console.log('❌ Cosmos DB credentials not provided!');
      console.log('Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY in your .env file');
      return;
    }

    // Get database and container
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: databaseId
    });

    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: '/id'
    });

    // Check if admin already exists
    const adminQuery = {
      query: 'SELECT * FROM c WHERE c.role = @role',
      parameters: [{ name: '@role', value: 'admin' }]
    };

    const { resources: existingAdmins } = await container.items.query(adminQuery).fetchAll();

    if (existingAdmins.length > 0) {
      console.log('❌ Admin user already exists!');
      return;
    }

    // Hash password
    const password = process.env.ADMIN_PASSWORD || 'admin123456';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = {
      id: uuidv4(),
      email: process.env.ADMIN_EMAIL || 'admin@planor.com',
      name: process.env.ADMIN_NAME || 'System Administrator',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      password: hashedPassword
    };

    await container.items.create(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser(); 