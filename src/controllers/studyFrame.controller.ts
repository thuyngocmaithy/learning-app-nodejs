// studyFrame.controller.ts
import { Request, Response } from 'express';
import { StudyFrameService } from '../services/studyFrame.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { StudyFrame } from '../entities/StudyFrame';
export class StudyFrameController {
  private studyFrameService: StudyFrameService;

  constructor(dataSource: DataSource) {
    this.studyFrameService = new StudyFrameService(dataSource);
  }

  public getAllStudyFrames = (req: Request, res: Response) => RequestHandler.getAll<StudyFrame>(req, res, this.studyFrameService);
  public getStudyFrameById = (req: Request, res: Response) => RequestHandler.getById<StudyFrame>(req, res, this.studyFrameService);
  public createStudyFrame = (req: Request, res: Response) => RequestHandler.create<StudyFrame>(req, res, this.studyFrameService);
  public updateStudyFrame = (req: Request, res: Response) => RequestHandler.update<StudyFrame>(req, res, this.studyFrameService);
  public deleteStudyFrame = (req: Request, res: Response) => RequestHandler.delete(req, res, this.studyFrameService);
}
