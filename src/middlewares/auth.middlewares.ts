import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { response } from '../utils/responseHelper';
import { AppDataSource } from '../data-source'; // Import DataSource từ TypeORM
import { Account } from '../entities/Account'; // Import model Account

// Lấy bí mật JWT từ biến môi trường hoặc đặt giá trị mặc định
const JWT_SECRET = process.env.JWT_SECRET as string;

// Định nghĩa kiểu dữ liệu cho token đã giải mã
interface DecodedToken {
  accountId: number;
  email: string;
  mssv: string;
}

// Mở rộng kiểu Request của Express để thêm thuộc tính account
declare global {
  namespace Express {
    interface Request {
      account?: Account;
    }
  }
}

// Middleware xác thực token JWT
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Lấy header Authorization từ yêu cầu
  const authHeader = req.headers['authorization'];
  // Lấy token từ header
  const token = authHeader && authHeader.split(' ')[1];

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return await response(res, 401, 'error', null, 'Không tìm thấy access token');
  }

  try {
    // Giải mã token và gán thông tin vào req.account
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Tìm tài khoản trong cơ sở dữ liệu
    const accountRepository = AppDataSource.getRepository(Account);
    const account = await accountRepository.findOneBy({ id: decoded.accountId });

    if (!account) {
      return await response(res, 403, 'error', null, 'Tài khoản không tồn tại');
    }

    req.account = account;
    next(); // Tiếp tục với middleware hoặc route handler kế tiếp
  } catch (error) {
    // Xử lý lỗi nếu token không hợp lệ hoặc đã hết hạn
    return await response(res, 403, 'error', null, 'Token không hợp lệ hoặc đã hết hạn');
  }
};
