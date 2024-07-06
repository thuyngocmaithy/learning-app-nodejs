import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { response } from '../utils/responseHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface DecodedToken {
  accountId: string;
  email: string;
  mssv: string;
}

declare global {
  namespace Express {
    interface Request {
      account?: DecodedToken;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return await response(res, 401, 'error', null, 'Access token not found');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.account = decoded;
    next();
  } catch (error) {
    return await response(res, 403, 'error', null, 'Invalid or expired token');
  }
};