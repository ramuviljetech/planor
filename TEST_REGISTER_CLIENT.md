# Testing Register Client API

## Overview
This document provides test cases for the `POST /api/admin/register-client` API to verify validation and functionality for both client-only and client+user scenarios.

## Test Cases

### 1. Client Only Registration (Valid)

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

### 2. Client + User Registration (Valid)

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
      "clientId": "client-uuid",
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

### 3. Validation Tests

#### 3.1 Missing Required Client Fields

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

#### 3.2 Invalid Email Format

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
    "primaryContactEmail": "invalid-email",
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
    "Please provide a valid primary contact email address"
  ]
}
```

#### 3.3 Invalid User Data (when user is provided)

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
      "username": "john",
      "email": "invalid-email"
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

### 4. Duplicate Tests

#### 4.1 Duplicate Organization Number

**Request:** (After creating a client with org number "123456789")
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "Another Company",
    "organizationNumber": "123456789",
    "industryType": "Technology",
    "address": "456 Other St, City, State 12345",
    "timezone": "America/New_York",
    "primaryContactName": "Jane Doe",
    "primaryContactEmail": "jane.doe@another.com",
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-987-6543"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Client with this organization number already exists"
}
```

#### 4.2 Duplicate User Email (when user is provided)

**Request:** (After creating a user with email "john.doe@acme.com")
```bash
curl -X POST http://localhost:3000/api/admin/register-client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "clientName": "New Company",
    "organizationNumber": "999999999",
    "industryType": "Technology",
    "address": "789 New St, City, State 12345",
    "timezone": "America/New_York",
    "primaryContactName": "Bob Smith",
    "primaryContactEmail": "bob.smith@newcompany.com",
    "primaryContactRole": "CEO",
    "primaryContactPhoneNumber": "+1-555-111-2222",
    "user": {
      "username": "bob.smith",
      "email": "john.doe@acme.com",
      "contact": "+1-555-111-2222"
    }
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

### 5. Optional Fields Tests

#### 5.1 With Optional Fields

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
    "description": "Technology company specializing in software solutions"
  }'
```

**Expected Response:** Should succeed with all fields including optional ones.

#### 5.2 Without Optional Fields

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

**Expected Response:** Should succeed without optional fields.

## Validation Summary

### Required Client Fields:
- `clientName` (2-100 characters)
- `organizationNumber` (non-empty string)
- `industryType` (non-empty string)
- `address` (non-empty string)
- `timezone` (non-empty string)
- `primaryContactName` (2-100 characters)
- `primaryContactEmail` (valid email format)
- `primaryContactRole` (non-empty string)
- `primaryContactPhoneNumber` (non-empty string)

### Optional Client Fields:
- `websiteUrl` (valid URI format)
- `description` (any string)

### Required User Fields (when user is provided):
- `username` (3-50 characters)
- `email` (valid email format)

### Optional User Fields:
- `contact` (any string)

### Functionality Summary:
1. **Client Only**: Creates client and returns client data
2. **Client + User**: Creates client, then user, sends welcome email, returns both with temporary password
3. **Validation**: Uses appropriate schema based on presence of user data
4. **Error Handling**: Proper error messages for validation, duplicates, and server errors
5. **Security**: Admin authentication required 