import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { User } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
export const JWT_EXPIRES_IN = '24h'


// Helper function to compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword)
  }
  
  // Helper function to generate JWT token
  export const generateToken = (user: User): string => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  export const generateTempToken = (user: User): string => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: process.env.TEMP_EXPIRES_IN || '5m'} as SignOptions
    )
  }
  
  // Helper function to hash password
  export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }
  
  