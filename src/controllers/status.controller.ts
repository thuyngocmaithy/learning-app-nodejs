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
  public createStatus = (req: Request, res: Response) => RequestHandler.create<Status>(req, res, this.statusService);
  public updateStatus = (req: Request, res: Response) => RequestHandler.update<Status>(req, res, this.statusService);
  public deleteStatus = (req: Request, res: Response) => RequestHandler.delete(req, res, this.statusService);
}