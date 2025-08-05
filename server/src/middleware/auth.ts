import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, User, UserStatus } from '../types';
import { getUsersContainer } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    // Get user from database
    const usersContainer = getUsersContainer();
    const { resource: user } = await usersContainer.item(decoded.id, decoded.id).read();

    if (!user || user.status === UserStatus.BLOCK) {
      res.status(401).json({
        success: false,
        error: 'User not found or blocked'
      });
      return;
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    const authReq = req as AuthenticatedRequest;
    authReq.user = userWithoutPassword as User;
    authReq.userRole = userWithoutPassword.role;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token or token expired'
      });
      return;
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
    return;
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }
    
    next();
  };
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }
  
  if (authReq.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
    return;
  }
  
  next();
}; 