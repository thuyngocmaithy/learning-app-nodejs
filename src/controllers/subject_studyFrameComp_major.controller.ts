import { Request, Response } from 'express';
import { Subject_StudyFrameComp_MajorService } from '../services/subject_studyFrameComp_major.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject_StudyFrameComp_Major } from '../entities/Subject_StudyFrameComp_Major';
import { StatusCodes } from 'http-status-codes';
export class Subject_StudyFrameComp_MajorController {
  private subject_studyFrameComp_majorService: Subject_StudyFrameComp_MajorService;

  constructor(dataSource: DataSource) {
    this.subject_studyFrameComp_majorService = new Subject_StudyFrameComp_MajorService(dataSource);
  }

  public getAllSubject_StudyFrameComp_Majors = (req: Request, res: Response) => RequestHandler.getAll<Subject_StudyFrameComp_Major>(req, res, this.subject_studyFrameComp_majorService);
  public getSubject_StudyFrameComp_MajorById = (req: Request, res: Response) => RequestHandler.getById<Subject_StudyFrameComp_Major>(req, res, this.subject_studyFrameComp_majorService);
  public createSubject_StudyFrameComp_Major = (req: Request, res: Response) => RequestHandler.create<Subject_StudyFrameComp_Major>(req, res, this.subject_studyFrameComp_majorService);
  public updateSubject_StudyFrameComp_Major = (req: Request, res: Response) => RequestHandler.update<Subject_StudyFrameComp_Major>(req, res, this.subject_studyFrameComp_majorService);
  public deleteSubject_StudyFrameComp_Major = (req: Request, res: Response) => RequestHandler.delete(req, res, this.subject_studyFrameComp_majorService);
  public getSubject_StudyFrameComp_MajorWhere = (req: Request, res: Response) => RequestHandler.getWhere<Subject_StudyFrameComp_Major>(req, res, this.subject_studyFrameComp_majorService);

  public createSSMByListSubject = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      const result = await this.subject_studyFrameComp_majorService.createByListSubject(data);
      RequestHandler.sendResponse(res, StatusCodes.CREATED, "success", result);
    } catch (error) {
      console.error("Create Error:", error);
      RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }
}
