# Multiple Users Registration Test

## Overview
This document tests the enhanced `POST /api/admin/register-client` API that now supports creating multiple users at the same time when creating a client.

## New Functionality

### ✅ **Support for Multiple Users**
The API now accepts either:
1. **Single User**: `"user": { ... }`
2. **Multiple Users**: `"user": [ { ... }, { ... }, { ... } ]`

### ✅ **Validation Rules**
- Maximum 10 users can be created at once
- No duplicate email addresses among users
- All required fields must be provided for each user
- Each user gets a unique temporary password

## Test Cases

### 1. ✅ Single User Registration (Backward Compatible)

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Acme Corporation",
    "organizationNumber": "123456789",
    "industryType": "Technology",
    "address": "123 Main St, City, State 12345",
    "websiteUrl": "https://acme.com",
    "timezone": "America/New_York",
    "primaryContactName": "John Doe",
    "primaryContactEmail": "john.doe@acme.com",
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-123-4567",
    "description": "Technology company specializing in software solutions",
    "user": {
      "username": "john.doe",
      "contact": "+1-555-123-4567",
      "email": "john.doe@acme.com"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client and standard user created successfully",
  "data": {
    "client": {
      "id": "client-uuid",
      "clientName": "Acme Corporation",
      "organizationNumber": "123456789",
      "industryType": "Technology",
      "address": "123 Main St, City, State 12345",
      "websiteUrl": "https://acme.com",
      "timezone": "America/New_York",
      "primaryContactName": "John Doe",
      "primaryContactEmail": "john.doe@acme.com",
      "primaryContactRole": "CEO",
      "primaryContactPhoneNumber": "+1-555-123-4567",
      "description": "Technology company specializing in software solutions",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "users": [
      {
        "id": "user-uuid",
        "username": "john.doe",
        "email": "john.doe@acme.com",
        "clientId": "client-uuid",
        "contact": "+1-555-123-4567",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z"
      }
    ],
    "temporaryPasswords": [
      {
        "email": "john.doe@acme.com",
        "username": "john.doe",
        "temporaryPassword": "generated-temp-password"
      }
    ]
  }
}
```

### 2. ✅ Multiple Users Registration

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Tech Solutions Inc",
    "organizationNumber": "987654321",
    "industryType": "Software Development",
    "address": "456 Tech Ave, Silicon Valley, CA 94000",
    "websiteUrl": "https://techsolutions.com",
    "timezone": "America/Los_Angeles",
    "primaryContactName": "Jane Smith",
    "primaryContactEmail": "jane.smith@techsolutions.com",
    "primaryContactRole": "CTO",
    "primaryContactPhoneNumber": "+1-555-987-6543",
    "description": "Software development company",
    "user": [
      {
        "username": "jane.smith",
        "contact": "+1-555-987-6543",
        "email": "jane.smith@techsolutions.com"
      },
      {
        "username": "bob.developer",
        "contact": "+1-555-111-2222",
        "email": "bob.developer@techsolutions.com"
      },
      {
        "username": "alice.designer",
        "contact": "+1-555-333-4444",
        "email": "alice.designer@techsolutions.com"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client and 3 standard users created successfully",
  "data": {
    "client": {
      "id": "client-uuid",
      "clientName": "Tech Solutions Inc",
      "organizationNumber": "987654321",
      "industryType": "Software Development",
      "address": "456 Tech Ave, Silicon Valley, CA 94000",
      "websiteUrl": "https://techsolutions.com",
      "timezone": "America/Los_Angeles",
      "primaryContactName": "Jane Smith",
      "primaryContactEmail": "jane.smith@techsolutions.com",
      "primaryContactRole": "CTO",
      "primaryContactPhoneNumber": "+1-555-987-6543",
      "description": "Software development company",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "users": [
      {
        "id": "user-uuid-1",
        "username": "jane.smith",
        "email": "jane.smith@techsolutions.com",
        "clientId": "client-uuid",
        "contact": "+1-555-987-6543",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "user-uuid-2",
        "username": "bob.developer",
        "email": "bob.developer@techsolutions.com",
        "clientId": "client-uuid",
        "contact": "+1-555-111-2222",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "user-uuid-3",
        "username": "alice.designer",
        "email": "alice.designer@techsolutions.com",
        "clientId": "client-uuid",
        "contact": "+1-555-333-4444",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z"
      }
    ],
    "temporaryPasswords": [
      {
        "email": "jane.smith@techsolutions.com",
        "username": "jane.smith",
        "temporaryPassword": "generated-temp-password-1"
      },
      {
        "email": "bob.developer@techsolutions.com",
        "username": "bob.developer",
        "temporaryPassword": "generated-temp-password-2"
      },
      {
        "email": "alice.designer@techsolutions.com",
        "username": "alice.designer",
        "temporaryPassword": "generated-temp-password-3"
      }
    ]
  }
}
```

## Validation Tests

### 3. ❌ Duplicate Emails Among Users

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Tech Solutions Inc",
    "organizationNumber": "987654321",
    "industryType": "Software Development",
    "address": "456 Tech Ave, Silicon Valley, CA 94000",
    "websiteUrl": "https://techsolutions.com",
    "timezone": "America/Los_Angeles",
    "primaryContactName": "Jane Smith",
    "primaryContactEmail": "jane.smith@techsolutions.com",
    "primaryContactRole": "CTO",
    "primaryContactPhoneNumber": "+1-555-987-6543",
    "description": "Software development company",
    "user": [
      {
        "username": "jane.smith",
        "contact": "+1-555-987-6543",
        "email": "jane.smith@techsolutions.com"
      },
      {
        "username": "bob.developer",
        "contact": "+1-555-111-2222",
        "email": "jane.smith@techsolutions.com" // Duplicate email
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Duplicate email addresses found among users"
}
```

### 4. ❌ Too Many Users (More than 10)

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Large Company",
    "organizationNumber": "111111111",
    "industryType": "Technology",
    "address": "123 Main St, City, State 12345",
    "websiteUrl": "https://largecompany.com",
    "timezone": "America/New_York",
    "primaryContactName": "John Doe",
    "primaryContactEmail": "john.doe@largecompany.com",
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-123-4567",
    "description": "Large technology company",
    "user": [
      // 11 users (more than maximum allowed)
      {"username": "user1", "contact": "+1-555-111-1111", "email": "user1@company.com"},
      {"username": "user2", "contact": "+1-555-111-1112", "email": "user2@company.com"},
      {"username": "user3", "contact": "+1-555-111-1113", "email": "user3@company.com"},
      {"username": "user4", "contact": "+1-555-111-1114", "email": "user4@company.com"},
      {"username": "user5", "contact": "+1-555-111-1115", "email": "user5@company.com"},
      {"username": "user6", "contact": "+1-555-111-1116", "email": "user6@company.com"},
      {"username": "user7", "contact": "+1-555-111-1117", "email": "user7@company.com"},
      {"username": "user8", "contact": "+1-555-111-1118", "email": "user8@company.com"},
      {"username": "user9", "contact": "+1-555-111-1119", "email": "user9@company.com"},
      {"username": "user10", "contact": "+1-555-111-1120", "email": "user10@company.com"},
      {"username": "user11", "contact": "+1-555-111-1121", "email": "user11@company.com"}
    ]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Maximum 10 users can be created at once"
  ]
}
```

### 5. ❌ Empty User Array

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Tech Solutions Inc",
    "organizationNumber": "987654321",
    "industryType": "Software Development",
    "address": "456 Tech Ave, Silicon Valley, CA 94000",
    "websiteUrl": "https://techsolutions.com",
    "timezone": "America/Los_Angeles",
    "primaryContactName": "Jane Smith",
    "primaryContactEmail": "jane.smith@techsolutions.com",
    "primaryContactRole": "CTO",
    "primaryContactPhoneNumber": "+1-555-987-6543",
    "description": "Software development company",
    "user": []
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "At least one user must be provided"
  ]
}
```

## Functionality Verification

### 6. ✅ Client ID Assignment for All Users

**Test:** Verify that all users created have the same `clientId` as the newly created client.

**Verification Steps:**
1. Create client with multiple users
2. Check that all users have `clientId` equal to the client's ID
3. Verify in database that all relationships are correct

### 7. ✅ Database Relationship Test

**SQL Query to Verify Multiple Users:**
```sql
SELECT 
  u.id as user_id,
  u.username,
  u.email,
  u.clientId,
  c.id as client_id,
  c.clientName
FROM users u
JOIN clients c ON u.clientId = c.id
WHERE c.clientName = 'Tech Solutions Inc'
ORDER BY u.username;
```

**Expected Result:**
```
user_id | username      | email                           | clientId  | client_id | clientName
--------|---------------|----------------------------------|-----------|-----------|------------
uuid-1  | alice.designer| alice.designer@techsolutions.com| client-uuid | client-uuid | Tech Solutions Inc
uuid-2  | bob.developer | bob.developer@techsolutions.com | client-uuid | client-uuid | Tech Solutions Inc
uuid-3  | jane.smith    | jane.smith@techsolutions.com   | client-uuid | client-uuid | Tech Solutions Inc
```

### 8. ✅ Email Notifications for All Users

**Test:** Verify that welcome emails are sent to all users.

**Expected Behavior:**
- Each user receives a welcome email (if mail service is configured)
- Email failures don't stop the creation process
- Each email contains the correct username and client name

## Key Features Summary

### ✅ **Multiple Users Support:**
- ✅ Single user (backward compatible)
- ✅ Multiple users (up to 10)
- ✅ Unique temporary passwords for each user
- ✅ Individual welcome emails for each user

### ✅ **Validation:**
- ✅ No duplicate emails among users
- ✅ Maximum 10 users limit
- ✅ All required fields validated for each user
- ✅ Proper error messages

### ✅ **Database:**
- ✅ All users linked to the same client
- ✅ Correct client ID assignment
- ✅ Proper database relationships

### ✅ **Security:**
- ✅ Unique passwords for each user
- ✅ Password hashing
- ✅ Admin authentication required

### ✅ **Response Format:**
- ✅ Consistent response structure
- ✅ Users array instead of single user
- ✅ Temporary passwords array with email mapping
- ✅ Dynamic success message based on user count

## Usage Examples

### Single User (Legacy Format):
```json
{
  "user": {
    "username": "john.doe",
    "email": "john.doe@company.com",
    "contact": "+1-555-123-4567"
  }
}
```

### Multiple Users (New Format):
```json
{
  "user": [
    {
      "username": "john.doe",
      "email": "john.doe@company.com",
      "contact": "+1-555-123-4567"
    },
    {
      "username": "jane.smith",
      "email": "jane.smith@company.com",
      "contact": "+1-555-987-6543"
    }
  ]
}
```

The API now supports creating multiple users efficiently while maintaining all validation and security features! 🎉 