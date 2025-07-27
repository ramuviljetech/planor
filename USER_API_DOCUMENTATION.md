# User Management API Documentation

This document describes the user CRUD operations with role-based access control for the Planör Portal API.

## Base URL
```
http://localhost:3001/api/users
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- **ADMIN**: Full access to all user operations
- **STANDARD_USER**: Can view and update their own profile
- **CLIENT**: Can view and update their own profile

## API Endpoints

### 1. List Users (Admin Only)
**GET** `/api/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (admin, standard_user, client)
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "users": [
    {
      "id": "1",
      "email": "admin@planor.com",
      "name": "Admin User",
      "role": "admin",
      "clientId": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T00:00:00.000Z",
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/users?page=1&limit=5&role=admin" \
  -H "Authorization: Bearer <token>"
```

### 2. Get User by ID
**GET** `/api/users/:id`

**Permissions:**
- Admin can view any user
- Users can only view their own profile

**Response:**
```json
{
  "id": "1",
  "email": "admin@planor.com",
  "name": "Admin User",
  "role": "admin",
  "clientId": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2024-01-15T00:00:00.000Z",
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/users/1" \
  -H "Authorization: Bearer <token>"
```

### 3. Create User (Admin Only)
**POST** `/api/users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "standard_user",
  "clientId": null,
}
```

**Validation Rules:**
- Email must be valid format
- Email must be unique
- Role must be valid (admin, standard_user, client)
- Client ID required for CLIENT role

**Response:**
```json
{
  "id": "4",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "standard_user",
  "clientId": null,
  "isActive": true,
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z",
  "lastLoginAt": null,
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/api/users" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "role": "standard_user"
  }'
```

### 4. Update User
**PUT** `/api/users/:id`

**Permissions:**
- Admin can update any user
- Users can only update their own basic info (name, email)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "1",
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "admin",
  "clientId": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T00:00:00.000Z",
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3001/api/users/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### 5. Delete User (Admin Only)
**DELETE** `/api/users/:id`

**Note:** This performs a soft delete by setting `isActive` to false.

**Response:**
```json
{
  "message": "User deactivated successfully"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3001/api/users/3" \
  -H "Authorization: Bearer <token>"
```

### 6. Activate User (Admin Only)
**PATCH** `/api/users/:id/activate`

**Response:**
```json
{
  "id": "3",
  "email": "client@example.com",
  "name": "Client User",
  "role": "client",
  "clientId": "client-1",
  "isActive": true,
  "createdAt": "2024-01-03T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z",
  "lastLoginAt": "2024-01-13T00:00:00.000Z",
}
```

**Example:**
```bash
curl -X PATCH "http://localhost:3001/api/users/3/activate" \
  -H "Authorization: Bearer <token>"
```

### 7. Get Current User Profile
**GET** `/api/users/me/profile`

**Response:**
```json
{
  "id": "2",
  "email": "user@planor.com",
  "name": "Standard User",
  "role": "standard_user",
  "clientId": null,
  "isActive": true,
  "createdAt": "2024-01-02T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "lastLoginAt": "2024-01-14T00:00:00.000Z",
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/users/me/profile" \
  -H "Authorization: Bearer <token>"
```

### 8. Update Current User Profile
**PUT** `/api/users/me/profile`

**Permissions:** Users can only update their own name and email.

**Request Body:**
```json
{
  "name": "My Updated Name",
  "email": "myupdated@example.com"
}
```

**Response:**
```json
{
  "id": "2",
  "email": "myupdated@example.com",
  "name": "My Updated Name",
  "role": "standard_user",
  "clientId": null,
  "isActive": true,
  "createdAt": "2024-01-02T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z",
  "lastLoginAt": "2024-01-14T00:00:00.000Z",
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3001/api/users/me/profile" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Updated Name",
    "email": "myupdated@example.com"
  }'
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: email, name, role"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Role-Based Access Control Summary

| Operation | ADMIN | STANDARD_USER | CLIENT |
|-----------|-------|---------------|--------|
| List all users | ✅ | ❌ | ❌ |
| Get any user | ✅ | ❌ | ❌ |
| Get own profile | ✅ | ✅ | ✅ |
| Create user | ✅ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ |
| Update own profile | ✅ | ✅ (name, email only) | ✅ (name, email only) |
| Delete user | ✅ | ❌ | ❌ |
| Activate user | ✅ | ❌ | ❌ |

## Testing with Mock Data

The API includes mock data for testing:

1. **Admin User**
   - ID: `1`
   - Email: `admin@planor.com`
   - Role: `admin`

2. **Standard User**
   - ID: `2`
   - Email: `user@planor.com`
   - Role: `standard_user`

3. **Client User**
   - ID: `3`
   - Email: `client@example.com`
   - Role: `client`
   - Client ID: `client-1`

## Notes

- All timestamps are in ISO 8601 format
- User deletion is soft delete (sets `isActive` to false)
- Email addresses must be unique across all users
- Client users must have a `clientId` assigned