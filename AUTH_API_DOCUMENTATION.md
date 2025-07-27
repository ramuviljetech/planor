# Authentication API Documentation

This document describes the authentication endpoints for the Planör Portal API using Cosmos DB.

## Business Logic Overview

Based on the Planör Portal requirements:

### User Hierarchy:
- **Admin Users** (Top Level): Can create Standard Users and Clients, manage all users, and update their own profile
- **Client Users** (Middle Level): Can only update their own profile, no user creation capabilities
- **Standard Users** (Bottom Level): Can only update their own profile, must be assigned to a client

### User Creation Rules:
- **Admins** can create both Standard Users and Clients
- **Standard Users** must be assigned to a Client (clientId required)
- **Clients** are not assigned to other clients (clientId not allowed)
- **Public Registration**: Not available - only admins can create new users
- **Profile Management**: All users can update their own name and email

## Base URL
```
http://localhost:3001/api/auth
```

## Authentication Endpoints

### 1. User Registration (Admin Only)
**POST** `/api/auth/register`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "role": "standard_user",
  "clientId": null,
}
```

**Validation Rules:**
- **Admin authentication required**
- Email must be valid format
- Email must be unique
- Password must be at least 8 characters
- Role must be either "standard_user" or "client" (admin cannot create other admins)
- **Standard Users**: Client ID required (must be assigned to a client)
- **Clients**: Client ID not allowed (clients are not assigned to other clients)

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "standard_user",
      "clientId": null,
      "isActive": true,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z",
      "lastLoginAt": null,
    }
  }
}
```

**Examples:**

**Creating a Standard User (assigned to a client):**
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123",
    "role": "standard_user",
    "clientId": "client-123"
  }'
```

**Creating a Client User:**
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "name": "Client Company",
    "password": "securepassword123",
    "role": "client"
  }'
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "standard_user",
      "clientId": null,
      "isActive": true,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z",
      "lastLoginAt": "2024-01-20T10:30:00.000Z",
    },
    "token": "jwt-token-here",
    "expiresIn": "24h"
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. Get Current User Profile
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "standard_user",
    "clientId": null,
    "isActive": true,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z",
    "lastLoginAt": "2024-01-20T10:30:00.000Z",
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/auth/me" \
  -H "Authorization: Bearer <jwt-token>"
```

### 4. Update Current User Profile
**PUT** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "standard_user",
    "clientId": null,
    "isActive": true,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:35:00.000Z",
    "lastLoginAt": "2024-01-20T10:30:00.000Z",
  }
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3001/api/auth/me" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### 5. Change Password
**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/api/auth/change-password" \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }'
```

### 6. Update User (Admin Only)
**PUT** `/api/auth/users/:id`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "standard_user",
  "clientId": "client-123",
  "isActive": true,
  "password": "newpassword123"
}
```

**Validation Rules:**
- **Admin authentication required**
- Email must be valid format (if being updated)
- Email must be unique (if being updated)
- Password must be at least 8 characters (if being updated)
- Role must be valid (admin, standard_user, client)
- **Standard Users**: Client ID required (must be assigned to a client)
- **Clients**: Client ID not allowed (clients are not assigned to other clients)
- Admin cannot change their own role or deactivate themselves

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "standard_user",
    "clientId": "client-123",
    "isActive": true,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:35:00.000Z",
    "lastLoginAt": "2024-01-20T10:30:00.000Z",
  }
}
```

**Examples:**

**Updating a Standard User:**
```bash
curl -X PUT "http://localhost:3001/api/auth/users/user-id-here" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated User Name",
    "email": "updated@example.com",
    "clientId": "client-123"
  }'
```

**Updating a Client User:**
```bash
curl -X PUT "http://localhost:3001/api/auth/users/client-id-here" \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Client Name",
    "email": "client@example.com"
  }'
```

### 7. User Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/api/auth/logout" \
  -H "Authorization: Bearer <jwt-token>"
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: email, name, password"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You can only update your name and email"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## JWT Token Usage

After successful login or registration, you'll receive a JWT token. Include this token in the Authorization header for protected endpoints:

```
Authorization: Bearer <jwt-token>
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cosmos DB Configuration
COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_DB_KEY=your-cosmos-db-primary-key
COSMOS_DB_NAME=planor-portal
```

## Cosmos DB Setup

1. Create a Cosmos DB account in Azure
2. Create a database named `planor-portal`
3. Create a container named `users` with partition key `/id`
4. Get the endpoint and primary key from the Azure portal
5. Update your `.env` file with the Cosmos DB credentials

## Initial Admin User Setup

Since there's no public registration, you need to create the first admin user:

1. Set up your environment variables in `.env` file
2. Run the admin creation script:
   ```bash
   npm run create-admin
   ```
3. This will create an admin user with the credentials specified in your `.env` file
4. Login with the admin credentials to start creating other users

## Security Features

- **Admin-Only User Creation**: Only admin users can create new Standard Users and Clients
- **Hierarchical User Management**: Admins → Clients → Standard Users (assigned to clients)
- **Client Assignment Validation**: Standard Users must be assigned to clients, Clients cannot be assigned to other clients
- **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication with 24-hour expiration
- **Input Validation**: Comprehensive validation for all inputs
- **Email Uniqueness**: Ensures email addresses are unique across users
- **Role-Based Access**: Different user roles with appropriate permissions
- **Account Status**: Support for active/inactive user accounts
- **No Public Registration**: Prevents unauthorized user creation

## Testing

You can test the authentication endpoints using curl or any API client like Postman. Make sure to:

1. Start the server with `npm run dev`
2. Set up your Cosmos DB connection
3. Use the provided curl examples to test each endpoint
4. Store the JWT token from login/register responses
5. Use the token in subsequent requests to protected endpoints 