import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { response } from '../utils/responseHelper';
import { AppDataSource } from '../data-source';
import { Account } from '../entities/Account';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface DecodedToken {
  accountId: string;
  email: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      account?: Account;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return await response(res, 401, 'error', null, 'Không tìm thấy access token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const accountRepository = AppDataSource.getRepository(Account);
    const account = await accountRepository.findOneBy({ id: decoded.accountId });

    if (!account) {
      return await response(res, 403, 'error', null, 'Tài khoản không tồn tại');
    }

    req.account = account;
    next();
  } catch (error) {
    return await response(res, 403, 'error', null, 'Token không hợp lệ hoặc đã hết hạn');
  }
};
