import request from 'supertest'

// Test against the actual running server
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001'

describe('Login API Tests', () => {
  const validUser = {
    email: 'admin@planor.com',
    password: 'admin123456'
  }

  describe('POST /api/auth/login - Success Cases', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(validUser)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('message', 'Login successful')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('expiresIn')
      expect(response.body.data.user).not.toHaveProperty('password')
    })

    test('should handle extra fields in request (should be stripped)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          ...validUser,
          extraField: 'should be stripped',
          anotherField: 123
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })
  })

  describe('POST /api/auth/login - Validation Error Cases', () => {
    test('should return 400 for invalid email format', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'invalid-email',
          password: validUser.password
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body).toHaveProperty('details')
      expect(Array.isArray(response.body.details)).toBe(true)
    })

    test('should return 400 for missing email', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          password: validUser.password
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body.details).toContain('Email is required')
    })

    test('should return 400 for empty email', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: '',
          password: validUser.password
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body.details).toContain('Email cannot be empty')
    })

    test('should return 400 for missing password', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: validUser.email
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body.details).toContain('Password is required')
    })

    test('should return 400 for empty password', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: validUser.email,
          password: ''
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body.details).toContain('Password cannot be empty')
    })

    test('should return 400 for multiple validation errors', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'invalid-email',
          password: ''
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Validation failed')
      expect(response.body.details.length).toBeGreaterThan(1)
    })
  })

  describe('POST /api/auth/login - Authentication Error Cases', () => {
    test('should return 401 for non-existent user', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'nonexistent@example.com',
          password: validUser.password
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Invalid email or password')
    })

    test('should return 401 for wrong password', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Invalid email or password')
    })

    test('should return 401 for blocked user', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'blocked@example.com',
          password: validUser.password
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Account is blocked')
    })
  })

  describe('POST /api/auth/login - Edge Cases', () => {
    test('should return 400 for invalid content type', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send(JSON.stringify(validUser))

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
    })

    test('should return 400 for malformed JSON', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "password123",}')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
    })

    test('should handle request without body', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('POST /api/auth/login - Performance Tests', () => {
    test('should respond within reasonable time', async () => {
      const startTime = Date.now()
      
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(validUser)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(2000) // Should respond within 2 seconds
    })
  })

  describe('POST /api/auth/login - Response Structure Tests', () => {
    test('should return correct user object structure', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(validUser)

      expect(response.status).toBe(200)
      
      const user = response.body.data.user
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('status')
      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
      expect(user).toHaveProperty('lastLoginAt')
      expect(user).not.toHaveProperty('password')
    })

    test('should return valid JWT token', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(validUser)

      expect(response.status).toBe(200)
      
      const token = response.body.data.token
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    test('should return token expiration time', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(validUser)

      expect(response.status).toBe(200)
      
      const expiresIn = response.body.data.expiresIn
      expect(expiresIn).toBeDefined()
      expect(typeof expiresIn).toBe('string')
    })
  })
}) 