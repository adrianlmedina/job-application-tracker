import { Request, Response, NextFunction } from 'express';


import jwt from 'jsonwebtoken';


router = Router()



declare global {

    namespace Express {

        interface Request {

            user?: { userID: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {

    return res.status(401).json({ error: 'Missing or invalid authorization header' });

  }

  const token = authHeader.split(' ')[1];

  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_in_production';

  try {

    const decoded = jwt.verify(token, jwtSecret) as { userID: string };


    req.user = decoded;

    next();
  } catch (error) {

    return res.status(401).json({ error: 'Invalid or expired token' });

  }
}






