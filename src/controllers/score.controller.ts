import { Request, Response } from 'express';
import { ScoreService } from '../services/score.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Score } from '../entities/Score';

export class ScoreController {
  private scoreService: ScoreService;

  constructor(dataSource: DataSource) {
    this.scoreService = new ScoreService(dataSource);
  }

  public getAllScores = (req: Request, res: Response) => RequestHandler.getAll<Score>(req, res, this.scoreService);
  public getScoreById = (req: Request, res: Response) => RequestHandler.getById<Score>(req, res, this.scoreService);
  public createScore = (req: Request, res: Response) => RequestHandler.create<Score>(req, res, this.scoreService);
  public updateScore = (req: Request, res: Response) => RequestHandler.update<Score>(req, res, this.scoreService);
  public deleteScore = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scoreService);
}