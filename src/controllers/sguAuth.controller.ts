// sguAuth.controller.ts
import { Request, Response } from 'express';
import { SguAuthService } from '../services/sguAuth.Service';

export class SguAuthController {
  private sguAuthService: SguAuthService;

  constructor() {
    this.sguAuthService = new SguAuthService();
  }

  public loginToSgu = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      const result = await this.sguAuthService.loginToSgu(username, password);
      res.json(result);
    } catch (error : any) {
      res.status(400).json({ message: error.message });
    }
  };
}
