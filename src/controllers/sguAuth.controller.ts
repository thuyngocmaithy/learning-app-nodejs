import { Request, Response } from 'express';
import { SguAuthService } from '../services/sguAuth.Service';
import { response } from '../utils/responseHelper';

export class SguAuthController {
  private sguAuthService: SguAuthService;

  constructor() {
    this.sguAuthService = new SguAuthService();
  }

  public loginToSgu = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
      const result = await this.sguAuthService.loginToSgu(username, password);
      await response(res, 200, 'success', result, 'Đăng nhập SGU thành công');
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      await response(res, 400, 'error', null, error.message);
    }
  };

  public getScore = async (req: Request, res: Response) => {
    const { ua, access_token } = req.body;
    try {
      const result = await this.sguAuthService.getScoreFromSGU(ua, access_token);
      await response(res, 200, 'success', result);
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      await response(res, 400, 'error', null, error.message);
    }
  };

}
