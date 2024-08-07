import { Request, Response } from 'express';
import { Subject_SemesterService } from '../services/subject_semester.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject_Semester } from '../entities/Subject_Semester';

export class Subject_SemesterController {
  private scoreService: Subject_SemesterService;

  constructor(dataSource: DataSource) {
    this.scoreService = new Subject_SemesterService(dataSource);
  }

  public getAllSubject_Semesters = (req: Request, res: Response) => RequestHandler.getAll<Subject_Semester>(req, res, this.scoreService);
  public getSubject_SemesterById = (req: Request, res: Response) => RequestHandler.getById<Subject_Semester>(req, res, this.scoreService);
  public createSubject_Semester = (req: Request, res: Response) => RequestHandler.create<Subject_Semester>(req, res, this.scoreService);
  public updateSubject_Semester = (req: Request, res: Response) => RequestHandler.update<Subject_Semester>(req, res, this.scoreService);
  public deleteSubject_Semester = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scoreService);
}