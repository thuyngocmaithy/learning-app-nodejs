import { Request, Response } from 'express';
import { login, refreshAccessToken } from '../services/auth.service';
import { response } from '../utils/responseHelper';

export const loginController = async (req: Request, res: Response): Promise<void> => {
    console.log('Nhận yêu cầu đăng nhập:', req.body);

    const { username, password } = req.body;

    try {
        const { accessToken, refreshToken, expiresIn , accountId , userId } = await login(username, password);
        await response(res, 200, 'success', { accessToken, refreshToken, expiresIn , accountId , userId  }, 'Đăng nhập thành công');
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
