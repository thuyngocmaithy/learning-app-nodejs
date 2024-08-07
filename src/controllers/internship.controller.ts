// internship.controller.ts
import { Request, Response } from 'express';
import { InternshipService } from '../services/internship.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Internship } from '../entities/Internship';

export class InternshipController {
  private internshipService: InternshipService;

  constructor(dataSource: DataSource) {
    this.internshipService = new InternshipService(dataSource);
  }

  public getAllInternships = (req: Request, res: Response) => RequestHandler.getAll<Internship>(req, res, this.internshipService);
  public getInternshipById = (req: Request, res: Response) => RequestHandler.getById<Internship>(req, res, this.internshipService);
  public createInternship = (req: Request, res: Response) => RequestHandler.create<Internship>(req, res, this.internshipService);
  public updateInternship = (req: Request, res: Response) => RequestHandler.update<Internship>(req, res, this.internshipService);
  public deleteInternship = (req: Request, res: Response) => RequestHandler.delete(req, res, this.internshipService);
}
