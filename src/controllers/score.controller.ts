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

  public getAllScores = (req: Request, res: Response) =>
    RequestHandler.getAll<Score>(req, res, this.scoreService);

  public getScoreById = (req: Request, res: Response) =>
    RequestHandler.getById<Score>(req, res, this.scoreService);

  public createScore = (req: Request, res: Response) =>
    RequestHandler.create<Score>(req, res, this.scoreService);

  public updateScore = (req: Request, res: Response) =>
    RequestHandler.update<Score>(req, res, this.scoreService);

  public deleteScore = (req: Request, res: Response) =>
    RequestHandler.delete(req, res, this.scoreService);

  public getScoreByStudentId = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const scores = await this.scoreService.getScoreByStudentId(studentId);
    res.status(200).json(scores);
  };

  public getScoreByStudentIdAndSemesterId = async (req: Request, res: Response) => {
    const { studentId, semesterId } = req.params;
    const scores = await this.scoreService.getScoreByStudentIdAndSemesterId(studentId, semesterId);
    res.status(200).json(scores);
  };

  public getScoreByStudentIdAndSubjectId = async (req: Request, res: Response) => {
    const { studentId, subjectId } = req.params;
    const score = await this.scoreService.getScoreByStudentIdAndSubjectId(studentId, subjectId);
    res.status(200).json(score);
  };
}