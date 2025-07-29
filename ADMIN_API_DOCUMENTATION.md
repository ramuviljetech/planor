# Admin API Documentation

## Overview
This document describes the admin-only APIs for managing clients and users in the system.

## Authentication
All admin APIs require authentication and admin privileges. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Register Client
**POST** `/api/admin/register-client`

Creates a new client. If user data is provided, it also creates one or multiple users for that client.

**Request Body (Client Only):**
```json
{
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
}
```

**Request Body (Client + User):**
```json
{
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
}
```

**Response (Client Only):**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client": {
      "id": "client-uuid",
      "clientName": "Acme Corporation",
      "organizationNumber": "123456789",
      // ... other client fields
    }
  }
}
```

**Response (Client + User):**
```json
{
  "success": true,
  "message": "Client and standard user created successfully",
  "data": {
    "client": {
      "id": "client-uuid",
      "clientName": "Acme Corporation",
      "organizationNumber": "123456789",
      // ... other client fields
    },
    "user": {
      "id": "user-uuid",
      "username": "john.doe",
      "email": "john.doe@acme.com",
      "clientId": "client-uuid",
      // ... other user fields (password excluded)
    },
    "temporaryPassword": "generated-temp-password"
  }
}
```

### 2. Register User Only
**POST** `/api/admin/register-user`

Creates a new standard user for an existing client.

**Request Body:**
```json
{
  "username": "jane.smith",
  "contact": "+1-555-987-6543",
  "email": "jane.smith@acme.com",
  "clientId": "existing-client-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Standard user created successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "username": "jane.smith",
      "email": "jane.smith@acme.com",
      "clientId": "existing-client-uuid",
      // ... other user fields (password excluded)
    },
    "temporaryPassword": "generated-temp-password"
  }
}
```

### 3. Register Client and User (Legacy)
**POST** `/api/admin/register`

Creates both a client and a user in a single request. This is the legacy endpoint that supports all three scenarios.

**Request Body (Client + User):**
```json
{
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
}
```

**Request Body (Client Only):**
```json
{
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
}
```

**Request Body (User Only):**
```json
{
  "clientId": "existing-client-uuid",
  "user": {
    "username": "jane.smith",
    "contact": "+1-555-987-6543",
    "email": "jane.smith@acme.com"
  }
}
```

### 4. Get Clients
**POST** `/api/admin/get-clients`

Retrieves clients with optional filtering and pagination.

**Request Body:**
```json
{
  "clientName": "Acme",
  "clientId": "client-uuid",
  "status": "active",
  "createdOn": "2024-01-15",
  "properties": 5,
  "maintananceCost": 1000,
  "page": 1,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client-uuid",
        "clientName": "Acme Corporation",
        "clientId": "123456789",
        "properties": 5,
        "createdOn": "2024-01-15T10:30:00Z",
        "status": "active",
        "primaryContactName": "John Doe",
        "primaryContactEmail": "john.doe@acme.com",
        "address": "123 Main St, City, State 12345",
        "industryType": "Technology",
        "timezone": "America/New_York",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "statistics": {
      "totalClients": 150,
      "newClientsThisMonth": 12
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalClients": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### 5. Get Standard Users
**GET** `/api/admin/standard-users`

Retrieves all standard users in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "username": "john.doe",
      "email": "john.doe@acme.com",
      "clientId": "client-uuid",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "lastLoginAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 6. Update User
**PUT** `/api/admin/profile/:id`

Updates a user's profile information.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@acme.com",
  "status": "active",
  "password": "new-password-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-uuid",
    "name": "John Smith",
    "email": "john.smith@acme.com",
    "status": "active",
    // ... other user fields (password excluded)
  }
}
```

### 7. Delete Standard User
**DELETE** `/api/admin/delete-users/:id`

Permanently deletes a standard user from the system.

**Response:**
```json
{
  "success": true,
  "message": "Standard user permanently deleted successfully"
}
```

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error messages"] // For validation errors
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient privileges)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Notes

1. **Password Generation**: When creating users, a temporary password is automatically generated and returned in the response. This password should be shared securely with the user.

2. **Email Notifications**: Welcome emails are automatically sent to new users if the mail service is configured.

3. **Validation**: All endpoints use Joi validation schemas to ensure data integrity.

4. **Admin Protection**: Admins cannot delete or block their own accounts.

5. **Client Dependencies**: Users can only be created for existing clients. The clientId must be provided and valid. 