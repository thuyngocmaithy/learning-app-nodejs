// academicYear.controller.ts
import { Request, Response } from 'express';
import { AcademicYearService } from '../services/academicYear.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { AcademicYear } from '../entities/AcademicYear';

export class AcademicYearController {
  private academicYearService: AcademicYearService;

  constructor(dataSource: DataSource) {
    this.academicYearService = new AcademicYearService(dataSource);
  }

  public getAllAcademicYears = (req: Request, res: Response) => RequestHandler.getAll<AcademicYear>(req, res, this.academicYearService);
  public getAcademicYearById = (req: Request, res: Response) => RequestHandler.getById<AcademicYear>(req, res, this.academicYearService);
  public createAcademicYear = (req: Request, res: Response) => RequestHandler.create<AcademicYear>(req, res, this.academicYearService);
  public updateAcademicYear = (req: Request, res: Response) => RequestHandler.update<AcademicYear>(req, res, this.academicYearService);
  public deleteAcademicYear = (req: Request, res: Response) => RequestHandler.delete(req, res, this.academicYearService);
}