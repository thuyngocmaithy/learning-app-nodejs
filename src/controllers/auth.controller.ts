import { Request, Response } from 'express';
import { login, refreshAccessToken } from '../services/auth.service';
import { SguAuthService } from '../services/sguAuth.Service';
import { response } from '../utils/responseHelper';
import { AppDataSource } from '../data-source';
import { Account } from '../entities/Account';

const sguAuthService = new SguAuthService();

export const loginController = async (req: Request, res: Response): Promise<void> => {
    console.log('Nhận yêu cầu đăng nhập:', req.body);

    const { username, password } = req.body;

    try {
        // Kiểm tra xem username có tồn tại trong bảng Account không
        const accountRepository = AppDataSource.getRepository(Account);
        const existingAccount = await accountRepository.findOne({ where: { username } });

        if (existingAccount) {
            // Nếu tồn tại, thực hiện đăng nhập thông thường
            const loginResult = await login(username, password);

            // Kiểm tra loại của loginResult
            if (loginResult && 'accountId' in loginResult && 'userId' in loginResult) {
                const { accessToken, refreshToken, expiresIn, accountId, userId } = loginResult;
                await response(res, 200, 'success', { accessToken, refreshToken, expiresIn, accountId, userId }, 'Đăng nhập thành công');
            } else if (loginResult && 'user' in loginResult) {
                // Trường hợp loginResult có thuộc tính 'user', xử lý tương ứng
                const { accessToken, refreshToken, expiresIn } = loginResult;
                const userId = loginResult.user.userId;
                await response(res, 200, 'success', { accessToken, refreshToken, expiresIn, userId }, 'Đăng nhập thành công');
            } else {
                throw new Error('Login result is not in expected format.');
            }
        } else {
            // Nếu không tồn tại, sử dụng đăng nhập qua SGU
            const authResponse = await sguAuthService.loginToSgu(username, password);
            await response(res, 200, 'success', authResponse, 'Đăng nhập SGU thành công');
        }
    } catch (error) {
        await response(res, 401, 'error', null, error instanceof Error ? error.message : 'Đăng nhập không thành công');
    }
};

export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    try {
        const accessToken = await refreshAccessToken(refreshToken);
        await response(res, 200, 'success', { accessToken }, 'Token truy cập đã được làm mới thành công');
    } catch (error) {
        await response(res, 401, 'error', null, error instanceof Error ? error.message : 'Làm mới token không thành công');
    }
};
