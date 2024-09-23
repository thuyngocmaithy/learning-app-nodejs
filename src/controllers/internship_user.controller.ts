import { Request, Response } from 'express';
import { Internship_UserService } from '../services/internship_user.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Internship_User } from '../entities/Internship_User';

export class Internship_UserController {
  private internshipUserService: Internship_UserService;

  constructor(dataSource: DataSource) {
    this.internshipUserService = new Internship_UserService(dataSource);
  }

  public getAllInternshipUser = (req: Request, res: Response) => RequestHandler.getAll<Internship_User>(req, res, this.internshipUserService);
  public getInternshipUserById = (req: Request, res: Response) => RequestHandler.getById<Internship_User>(req, res, this.internshipUserService);
  public createInternshipUser = (req: Request, res: Response) => RequestHandler.create<Internship_User>(req, res, this.internshipUserService);
  public updateInternshipUser = (req: Request, res: Response) => RequestHandler.update<Internship_User>(req, res, this.internshipUserService);
  public deleteInternshipUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.internshipUserService);
}