import { NextFunction, Request, Response } from "express";

// middleware/propertyAccess.ts
export const AccessControl = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
  
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  
    if (user.role === 'standard_user') {
      // Inject clientId into the query so controller doesn't need to worry
    //   console.log('clientId', user.clientId,user.role);
      req.query.clientId = user.clientId;
      return next();
    }
  
    // Admins can use any clientId
    if(user.role === 'admin'){
        return next();
    }
    else{
        return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }
  };
