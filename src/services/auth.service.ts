import { Account } from './../entities/Account';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const login = async (username: string, password: string) => {
    const accountRepository = AppDataSource.getRepository(Account);
    const userRepository = AppDataSource.getRepository(User);
    const account = await accountRepository.findOne({ where: { username } }) as Account;
    const user = await userRepository.findOne({ where: { account: { id: account.id } } });
    
    if (!account) {
        throw new Error('Tài khoản không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
        throw new Error('Mật khẩu không đúng');
    }

    // Tạo token với thông tin tài khoản
    const accessToken = jwt.sign({ accountId: account.id, email: account.email, username: account.username }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ accountId: account.id }, JWT_SECRET, { expiresIn: '7d' });

    // Trả về token và thông tin tài khoản
    return { accessToken, refreshToken, expiresIn: '1h', accountId: account.id , userId: user?.id };
};


export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { accountId: number };
        const accessToken = jwt.sign({ accountId: decoded.accountId }, JWT_SECRET, { expiresIn: '1h' });

        return accessToken;
    } catch (error) {
        throw new Error('Làm mới token không thành công');
    }
};
