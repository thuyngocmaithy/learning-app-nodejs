import { Request, Response } from 'express';
import { CycleService } from '../services/cycle.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Cycle } from '../entities/Cycle';

export class CycleController {
  private cycleService: CycleService;

  constructor(dataSource: DataSource) {
    this.cycleService = new CycleService(dataSource);
  }

  public getAllCycles = (req: Request, res: Response) => RequestHandler.getAll<Cycle>(req, res, this.cycleService);
  public getCycleWhere = (req: Request, res: Response) => RequestHandler.getWhere<Cycle>(req, res, this.cycleService);
  public getCycleById = (req: Request, res: Response) => RequestHandler.getById<Cycle>(req, res, this.cycleService);
  public createCycle = (req: Request, res: Response) => RequestHandler.create<Cycle>(req, res, this.cycleService);
  public updateCycle = (req: Request, res: Response) => RequestHandler.update<Cycle>(req, res, this.cycleService);
  public deleteCycle = (req: Request, res: Response) => RequestHandler.delete(req, res, this.cycleService);

  // Xử lý việc kiểm tra dữ liệu liên kết
  public async checkRelatedData(req: Request, res: Response): Promise<Response> {
    try {
      const ids = (req.query.ids as String).split(',');
      const result = await this.cycleService.checkRelatedData(ids);
      if (result?.success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({ success: false, message: result.message });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Lỗi khi kiểm tra dữ liệu liên kết: ${error}`,
      });
    }
  }
}