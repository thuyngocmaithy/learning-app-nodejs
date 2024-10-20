// major.controller.ts
import { Request, Response } from 'express';
import { MajorService } from '../services/major.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Major } from '../entities/Major';

export class MajorController {
  private majorService: MajorService;

  constructor(dataSource: DataSource) {
    this.majorService = new MajorService(dataSource);
  }

  public getAllMajors = (req: Request, res: Response) => RequestHandler.getAll<Major>(req, res, this.majorService);
  public getMajorById = (req: Request, res: Response) => RequestHandler.getById<Major>(req, res, this.majorService);
  public createMajor = (req: Request, res: Response) => RequestHandler.create<Major>(req, res, this.majorService);
  public updateMajor = (req: Request, res: Response) => RequestHandler.update<Major>(req, res, this.majorService);
  public deleteMajor = (req: Request, res: Response) => RequestHandler.delete(req, res, this.majorService);
  public getMajorWhere = (req: Request, res: Response) => RequestHandler.getWhere<Major>(req, res, this.majorService);
}