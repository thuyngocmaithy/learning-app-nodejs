// studyFrame.controller.ts
import { Request, Response } from 'express';
import { StudyFrame_ComponentService } from '../services/studyFrame_component.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { StudyFrame_Component } from '../entities/StudyFrame';
export class StudyFrame_ComponentController {
  private studyFrameService: StudyFrame_ComponentService;

  constructor(dataSource: DataSource) {
    this.studyFrameService = new StudyFrame_ComponentService(dataSource);
  }

  public getAllStudyFrame_Components = (req: Request, res: Response) => RequestHandler.getAll<StudyFrame_Component>(req, res, this.studyFrameService);
  public getStudyFrame_ComponentById = (req: Request, res: Response) => RequestHandler.getById<StudyFrame_Component>(req, res, this.studyFrameService);
  public createStudyFrame_Component = (req: Request, res: Response) => RequestHandler.create<StudyFrame_Component>(req, res, this.studyFrameService);
  public updateStudyFrame_Component = (req: Request, res: Response) => RequestHandler.update<StudyFrame_Component>(req, res, this.studyFrameService);
  public deleteStudyFrame_Component = (req: Request, res: Response) => RequestHandler.delete(req, res, this.studyFrameService);
}
