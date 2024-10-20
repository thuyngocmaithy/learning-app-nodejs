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


  public GetSubjectByMajor = async (req: Request, res: Response): Promise<void> => {
    try {
      const majorId = req.params.majorId;
      if (!majorId) {
        res.status(400).json({ message: 'majorId is required' });
        return;
      }
  
      const result = await this.studyFrameService.GetSubjectByMajor(majorId);
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No study frame found for the major' });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error('Error in GetSubjectByMajor:', error);
      res.status(500).json({
        error: 'Error executing stored procedure GetSubjectByMajor',
      });
    }
  }



}
