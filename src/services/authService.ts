import { AppDataSource } from '../data-source';
import { Account } from '../entities/Account';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Cấu hình JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Đăng ký tài khoản mới
 * @param email - Địa chỉ email của tài khoản
 * @param password - Mật khẩu của tài khoản
 * @param mssv - Mã số sinh viên (hoặc mã định danh khác)
 * @returns Tài khoản mới được tạo
 */
export const registerAccount = async (email: string, password: string, mssv: string) => {
    const accountRepository = AppDataSource.getRepository(Account);

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản mới trong cơ sở dữ liệu
    const newAccount = accountRepository.create({ email, password: hashedPassword, mssv });
    await accountRepository.save(newAccount);

    return newAccount;
};

/**
 * Đăng nhập và tạo token
 * @param mssv - Mã số sinh viên (hoặc mã định danh khác)
 * @param password - Mật khẩu của tài khoản
 * @returns Object chứa accessToken, refreshToken và thời gian hết hạn của accessToken
 */
export const loginAccount = async (mssv: string, password: string) => {
    const accountRepository = AppDataSource.getRepository(Account);

    // Tìm tài khoản trong cơ sở dữ liệu
    const account = await accountRepository.findOneBy({ mssv });
    if (!account) throw new Error('Tài khoản không tồn tại');

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) throw new Error('Thông tin đăng nhập không hợp lệ');

    // Tạo JWT token
    const accessToken = jwt.sign({ id: account.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: account.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 giờ
    };
};

/**
 * Làm mới access token
 * @param refreshToken - Refresh token hiện tại
 * @returns Access token mới
 */
export const refreshAccessToken = async (refreshToken: string) => {
    try {
        // Xác thực refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number };
        // Tạo access token mới
        const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '1h' });
        return newAccessToken;
    } catch (error) {
        throw new Error('Refresh token không hợp lệ');
    }
};
