// semester.controller.ts
import { Request, Response } from 'express';
import { SemesterService } from '../services/semeter.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Semester } from '../entities/Semester';

export class SemesterController {
  private semesterService: SemesterService;

  constructor(dataSource: DataSource) {
    this.semesterService = new SemesterService(dataSource);
  }

  public getAllSemesters = (req: Request, res: Response) => RequestHandler.getAll<Semester>(req, res, this.semesterService);
  public getSemesterById = (req: Request, res: Response) => RequestHandler.getById<Semester>(req, res, this.semesterService);
  public createSemester = (req: Request, res: Response) => RequestHandler.create<Semester>(req, res, this.semesterService);
  public updateSemester = (req: Request, res: Response) => RequestHandler.update<Semester>(req, res, this.semesterService);
  public deleteSemester = (req: Request, res: Response) => RequestHandler.delete(req, res, this.semesterService);
}