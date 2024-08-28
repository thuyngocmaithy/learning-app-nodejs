// sguAuth.controller.ts
import { Request, Response } from 'express';
import { SguAuthService } from '../services/sguAuth.Service';
import { log } from 'console';

export class SguAuthController {
  private sguAuthService: SguAuthService;

  constructor() {
    this.sguAuthService = new SguAuthService();
  }

  public loginToSgu = async (req: Request, res: Response) => {
    const { username , password } = req.body;
    console.log('Request body:', req.body);

    try {
      const result = await this.sguAuthService.loginToSgu(username, password);
      console.log('Login result:', result);
      res.json(result);
    } catch (error : any) {
      console.error('Error logging in:', error.message);
      res.status(400).json({ message: error.message });
    }
};

}
