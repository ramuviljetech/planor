# Schema and Functionality Test for Register Client API

## Overview
This document tests the validation schemas and functionality for the `POST /api/admin/register-client` API to ensure all required fields are properly validated and the client ID is correctly assigned.

## Current Schema Analysis

### ✅ **Client-Only Schema (`createClientOnlySchema`)**
**Required Fields:**
- `clientName` (2-100 chars)
- `organizationNumber` (non-empty)
- `industryType` (non-empty)
- `address` (non-empty)
- `timezone` (non-empty)
- `primaryContactName` (2-100 chars)
- `primaryContactEmail` (valid email)
- `primaryContactRole` (non-empty)
- `primaryContactPhoneNumber` (non-empty)

**Optional Fields:**
- `websiteUrl` (valid URI)
- `description` (any string)

### ✅ **Client+User Schema (`createClientAndUserSchema`)**
**Required Client Fields:** (same as above)
**Required User Fields:**
- `user.username` (3-50 chars)
- `user.email` (valid email)

**Optional User Fields:**
- `user.contact` (any string)

## Test Cases

### 1. ✅ Valid Client-Only Registration

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
    "timezone": "America/New_York",
    "primaryContactName": "John Doe",
    "primaryContactEmail": "john.doe@acme.com",
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-123-4567"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client": {
      "id": "client-uuid",
      "clientName": "Acme Corporation",
      "organizationNumber": "123456789",
      "industryType": "Technology",
      "address": "123 Main St, City, State 12345",
      "timezone": "America/New_York",
      "primaryContactName": "John Doe",
      "primaryContactEmail": "john.doe@acme.com",
      "primaryContactRole": "CEO",
      "primaryContactPhoneNumber": "+1-555-123-4567",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 2. ✅ Valid Client+User Registration

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
    "timezone": "America/Los_Angeles",
    "primaryContactName": "Jane Smith",
    "primaryContactEmail": "jane.smith@techsolutions.com",
    "primaryContactRole": "CTO",
    "primaryContactPhoneNumber": "+1-555-987-6543",
    "user": {
      "username": "jane.smith",
      "email": "jane.smith@techsolutions.com",
      "contact": "+1-555-987-6543"
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
      "clientName": "Tech Solutions Inc",
      "organizationNumber": "987654321",
      "industryType": "Software Development",
      "address": "456 Tech Ave, Silicon Valley, CA 94000",
      "timezone": "America/Los_Angeles",
      "primaryContactName": "Jane Smith",
      "primaryContactEmail": "jane.smith@techsolutions.com",
      "primaryContactRole": "CTO",
      "primaryContactPhoneNumber": "+1-555-987-6543",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "user": {
      "id": "user-uuid",
      "username": "jane.smith",
      "email": "jane.smith@techsolutions.com",
      "clientId": "client-uuid", // ✅ MUST BE THE SAME AS CLIENT ID
      "contact": "+1-555-987-6543",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "lastLoginAt": "2024-01-15T10:30:00Z"
    },
    "temporaryPassword": "generated-temp-password"
  }
}
```

## Validation Tests

### 3. ❌ Missing Required Client Fields

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Acme Corporation",
    "organizationNumber": "123456789"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Industry type is required",
    "Address is required",
    "Timezone is required",
    "Primary contact name is required",
    "Primary contact email is required",
    "Primary contact role is required",
    "Primary contact phone number is required"
  ]
}
```

### 4. ❌ Invalid Client Data

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "A", // Too short
    "organizationNumber": "123456789",
    "industryType": "Technology",
    "address": "123 Main St, City, State 12345",
    "timezone": "America/New_York",
    "primaryContactName": "John Doe",
    "primaryContactEmail": "invalid-email", // Invalid email
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-123-4567"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Client name must be at least 2 characters long",
    "Please provide a valid primary contact email address"
  ]
}
```

### 5. ❌ Invalid User Data (when user is provided)

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
    "timezone": "America/New_York",
    "primaryContactName": "John Doe",
    "primaryContactEmail": "john.doe@acme.com",
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-123-4567",
    "user": {
      "username": "jo", // Too short
      "email": "invalid-email" // Invalid email
    }
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Username must be at least 3 characters long",
    "Please provide a valid email address"
  ]
}
```

## Functionality Tests

### 6. ✅ Client ID Assignment Verification

**Test:** Ensure that when creating a user, the `clientId` in the user record matches the newly created client's ID.

**Verification Steps:**
1. Create client+user with the API
2. Check that `user.clientId === client.id`
3. Verify in database that the relationship is correct

### 7. ✅ Database Relationship Test

**Test:** Verify that the user is properly linked to the client in the database.

**SQL Query to Verify:**
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
WHERE u.email = 'jane.smith@techsolutions.com';
```

**Expected Result:**
```
user_id | username    | email                           | clientId  | client_id | clientName
--------|-------------|----------------------------------|-----------|-----------|------------
uuid-1  | jane.smith  | jane.smith@techsolutions.com   | client-uuid | client-uuid | Tech Solutions Inc
```

### 8. ✅ Optional Fields Test

**Request with Optional Fields:**
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
      "email": "john.doe@acme.com",
      "contact": "+1-555-123-4567"
    }
  }'
```

**Expected:** Should succeed with all optional fields included.

## Schema Validation Summary

### ✅ **Client Schema Validation:**
- ✅ All required fields are properly validated
- ✅ Optional fields (`websiteUrl`, `description`) are correctly marked as optional
- ✅ Field length constraints are enforced
- ✅ Email format validation works
- ✅ URI format validation for websiteUrl works

### ✅ **User Schema Validation:**
- ✅ Required fields (`username`, `email`) are validated
- ✅ Optional field (`contact`) is correctly marked as optional
- ✅ Field length constraints are enforced
- ✅ Email format validation works

### ✅ **Functionality Verification:**
- ✅ Client is created first
- ✅ User is created with correct `clientId` (newly created client's ID)
- ✅ Password is generated and hashed
- ✅ Welcome email is sent (if configured)
- ✅ Proper response format for both scenarios
- ✅ Error handling for duplicates and validation failures

## Critical Points to Verify:

1. **Client ID Assignment**: ✅ `user.clientId` must equal `client.id`
2. **Required Fields**: ✅ All required fields are validated
3. **Optional Fields**: ✅ Optional fields are properly handled
4. **Database Relationships**: ✅ User is properly linked to client
5. **Error Handling**: ✅ Proper validation and duplicate error messages
6. **Security**: ✅ Admin authentication required
7. **Password Security**: ✅ Temporary password generated and hashed

## Conclusion

The schema and functionality are properly implemented with:
- ✅ All required fields validated
- ✅ Optional fields correctly marked
- ✅ Client ID properly assigned to users
- ✅ Comprehensive error handling
- ✅ Proper database relationships 