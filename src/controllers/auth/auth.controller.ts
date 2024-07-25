// controllers/auth.controller.ts
import { Request, Response } from 'express';
import { registerAccount, loginAccount, refreshAccessToken } from '../../services/authService';
import { response } from '../../utils/responseHelper';

/**
 * Controller xử lý đăng ký tài khoản người dùng
 * @param req - Đối tượng yêu cầu HTTP
 * @param res - Đối tượng phản hồi HTTP
 */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  const { email, password, mssv } = req.body;

  try {
    // Gọi hàm đăng ký tài khoản từ service
    const newAccount = await registerAccount(email, password, mssv);
    // Gửi phản hồi thành công với thông tin tài khoản mới
    await response(res, 201, 'success', { Account: newAccount }, 'Tài khoản đã được đăng ký thành công');
  } catch (error) {
    // Gửi phản hồi lỗi nếu có lỗi xảy ra
    await response(res, 400, 'error', null, error instanceof Error ? error.message : 'Đăng ký không thành công');
  }
};

/**
 * Controller xử lý đăng nhập người dùng
 * @param req - Đối tượng yêu cầu HTTP
 * @param res - Đối tượng phản hồi HTTP
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  console.log('Nhận yêu cầu đăng nhập:', req.body); // Dòng log debug

  const { mssv, password } = req.body;

  try {
    // Gọi hàm đăng nhập từ service
    const { accessToken, refreshToken, expiresIn } = await loginAccount(mssv, password);
    // Gửi phản hồi thành công với thông tin token và thời gian hết hạn
    await response(res, 200, 'success', { accessToken, refreshToken, expiresIn }, 'Đăng nhập thành công');
  } catch (error) {
    // Gửi phản hồi lỗi nếu có lỗi xảy ra
    await response(res, 401, 'error', null, error instanceof Error ? error.message : 'Đăng nhập không thành công');
  }
};

/**
 * Controller xử lý làm mới token
 * @param req - Đối tượng yêu cầu HTTP
 * @param res - Đối tượng phản hồi HTTP
 */
export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  try {
    // Gọi hàm làm mới token từ service
    const accessToken = await refreshAccessToken(refreshToken);
    // Gửi phản hồi thành công với token truy cập mới
    await response(res, 200, 'success', { accessToken }, 'Token truy cập đã được làm mới thành công');
  } catch (error) {
    // Gửi phản hồi lỗi nếu có lỗi xảy ra
    await response(res, 401, 'error', null, error instanceof Error ? error.message : 'Làm mới token không thành công');
  }
};
