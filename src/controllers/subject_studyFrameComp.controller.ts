import { Request, Response } from 'express';
import { Subject_StudyFrameCompService } from '../services/subject_studyFrameComp.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject_StudyFrameComp } from '../entities/Subject_StudyFrameComp';
import { StatusCodes } from 'http-status-codes';
export class Subject_StudyFrameCompController {
  private subject_studyFrameCompService: Subject_StudyFrameCompService;

  constructor(dataSource: DataSource) {
    this.subject_studyFrameCompService = new Subject_StudyFrameCompService(dataSource);
  }

  public getAllSubject_StudyFrameComps = (req: Request, res: Response) => RequestHandler.getAll<Subject_StudyFrameComp>(req, res, this.subject_studyFrameCompService);
  public getSubject_StudyFrameCompById = (req: Request, res: Response) => RequestHandler.getById<Subject_StudyFrameComp>(req, res, this.subject_studyFrameCompService);
  public createSubject_StudyFrameComp = (req: Request, res: Response) => RequestHandler.create<Subject_StudyFrameComp>(req, res, this.subject_studyFrameCompService);
  public updateSubject_StudyFrameComp = (req: Request, res: Response) => RequestHandler.update<Subject_StudyFrameComp>(req, res, this.subject_studyFrameCompService);
  public deleteSubject_StudyFrameComp = (req: Request, res: Response) => RequestHandler.delete(req, res, this.subject_studyFrameCompService);
  public getSubject_StudyFrameCompWhere = (req: Request, res: Response) => RequestHandler.getWhere<Subject_StudyFrameComp>(req, res, this.subject_studyFrameCompService);

  public createSSMByListSubject = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      const result = await this.subject_studyFrameCompService.createByListSubject(data);
      RequestHandler.sendResponse(res, StatusCodes.CREATED, "success", result);
    } catch (error) {
      console.error("Create Error:", error);
      RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }

  public updateSSMByListSubject = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      const result = await this.subject_studyFrameCompService.updateByListSubject(data);
      if (result) {
        RequestHandler.sendResponse(res, StatusCodes.OK, "success", null, "Updated success");
      }
    } catch (error) {
      console.error("Create Error:", error);
      RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }
}
