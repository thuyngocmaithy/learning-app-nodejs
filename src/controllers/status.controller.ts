// status.controller.ts
import { Request, Response } from 'express';
import { StatusService } from '../services/status.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Status } from '../entities/Status';

export class StatusController {
  private statusService: StatusService;

  constructor(dataSource: DataSource) {
    this.statusService = new StatusService(dataSource);
  }

  public getAllStatuses = (req: Request, res: Response) => RequestHandler.getAll<Status>(req, res, this.statusService);
  public getStatusById = (req: Request, res: Response) => RequestHandler.getById<Status>(req, res, this.statusService);
  public getStatusByType = async (req: Request, res: Response) => {
    const type = req.query.type as 'Tiến độ đề tài NCKH' | 'Tiến độ khóa luận' | 'Tiến độ nhóm đề tài NCKH';
    if (!type) {
      return res.status(400).json({ message: 'Thiếu tham số type' });
    }

    try {
      const statuses = await this.statusService.getByType(type);
      res.status(200).json(statuses);
    } catch (error: any) {
      res.status(500).json({ message: 'Lỗi khi lấy trạng thái theo loại', error: error.message });
    }
  };
  public createStatus = (req: Request, res: Response) => RequestHandler.create<Status>(req, res, this.statusService);
  public updateStatus = (req: Request, res: Response) => RequestHandler.update<Status>(req, res, this.statusService);
  public deleteStatus = (req: Request, res: Response) => RequestHandler.delete(req, res, this.statusService);
}