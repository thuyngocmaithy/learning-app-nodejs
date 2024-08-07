import { Request, Response } from 'express';
import { Internship_FacultyService } from '../services/internship_faculty.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Internship_Faculty } from '../entities/Internship_Faculty';

export class Internship_FacultyController {
  private internshipFacultyService: Internship_FacultyService;

  constructor(dataSource: DataSource) {
    this.internshipFacultyService = new Internship_FacultyService(dataSource);
  }

  public getAllInternshipFaculties = (req: Request, res: Response) => RequestHandler.getAll<Internship_Faculty>(req, res, this.internshipFacultyService);
  public getInternshipFacultyById = (req: Request, res: Response) => RequestHandler.getById<Internship_Faculty>(req, res, this.internshipFacultyService);
  public createInternshipFaculty = (req: Request, res: Response) => RequestHandler.create<Internship_Faculty>(req, res, this.internshipFacultyService);
  public updateInternshipFaculty = (req: Request, res: Response) => RequestHandler.update<Internship_Faculty>(req, res, this.internshipFacultyService);
  public deleteInternshipFaculty = (req: Request, res: Response) => RequestHandler.delete(req, res, this.internshipFacultyService);
}