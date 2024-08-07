import { Request, Response } from 'express';
import { ComponentScoreService } from '../services/componentScore.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ComponentScore } from '../entities/Score';

export class ComponentScoreController {
  private componentScoreService: ComponentScoreService;

  constructor(dataSource: DataSource) {
    this.componentScoreService = new ComponentScoreService(dataSource);
  }

  public getAllComponentScores = (req: Request, res: Response) => RequestHandler.getAll<ComponentScore>(req, res, this.componentScoreService);
  public getComponentScoreById = (req: Request, res: Response) => RequestHandler.getById<ComponentScore>(req, res, this.componentScoreService);
  public createComponentScore = (req: Request, res: Response) => RequestHandler.create<ComponentScore>(req, res, this.componentScoreService);
  public updateComponentScore = (req: Request, res: Response) => RequestHandler.update<ComponentScore>(req, res, this.componentScoreService);
  public deleteComponentScore = (req: Request, res: Response) => RequestHandler.delete(req, res, this.componentScoreService);
}