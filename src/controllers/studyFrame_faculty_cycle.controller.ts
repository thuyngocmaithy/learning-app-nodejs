import { Request, Response } from 'express';
import { StudyFrame_Faculty_CycleService } from '../services/studyFrame_faculty_cycle.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { StudyFrame_Faculty_Cycle } from '../entities/StudyFrame_Faculty_Cycle';

export class StudyFrame_Faculty_CycleController {
  private studyFrame_faculty_cycleService: StudyFrame_Faculty_CycleService;

  constructor(dataSource: DataSource) {
    this.studyFrame_faculty_cycleService = new StudyFrame_Faculty_CycleService(dataSource);
  }

  public getAllStudyFrame_Faculty_Cycles = (req: Request, res: Response) => RequestHandler.getAll<StudyFrame_Faculty_Cycle>(req, res, this.studyFrame_faculty_cycleService);
  public getStudyFrame_Faculty_CycleById = (req: Request, res: Response) => RequestHandler.getById<StudyFrame_Faculty_Cycle>(req, res, this.studyFrame_faculty_cycleService);
  public createStudyFrame_Faculty_Cycle = (req: Request, res: Response) => RequestHandler.create<StudyFrame_Faculty_Cycle>(req, res, this.studyFrame_faculty_cycleService);
  public updateStudyFrame_Faculty_Cycle = (req: Request, res: Response) => RequestHandler.update<StudyFrame_Faculty_Cycle>(req, res, this.studyFrame_faculty_cycleService);
  public deleteStudyFrame_Faculty_Cycle = (req: Request, res: Response) => RequestHandler.delete(req, res, this.studyFrame_faculty_cycleService);
  public getStudyFrame_Faculty_CycleWhere = (req: Request, res: Response) => RequestHandler.getWhere<StudyFrame_Faculty_Cycle>(req, res, this.studyFrame_faculty_cycleService);
  public saveApplyFrame = (req: Request, res: Response) => {
    const data = req.body;
    try {
      const result = this.studyFrame_faculty_cycleService.saveApplyFrame(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to save data' });
    }
  };
}
