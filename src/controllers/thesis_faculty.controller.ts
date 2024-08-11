import { Request, Response } from 'express';
import { Thesis_UserService } from '../services/thesis_user.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Thesis_User } from '../entities/Thesis_User';

export class Thesis_UserController {
  private thesisUserService: Thesis_UserService;

  constructor(dataSource: DataSource) {
    this.thesisUserService = new Thesis_UserService(dataSource);
  }

  public getAllThesisUser = (req: Request, res: Response) => RequestHandler.getAll<Thesis_User>(req, res, this.thesisUserService);
  public getThesisUserById = (req: Request, res: Response) => RequestHandler.getById<Thesis_User>(req, res, this.thesisUserService);
  public createThesisUser = (req: Request, res: Response) => RequestHandler.create<Thesis_User>(req, res, this.thesisUserService);
  public updateThesisUser = (req: Request, res: Response) => RequestHandler.update<Thesis_User>(req, res, this.thesisUserService);
  public deleteThesisUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisUserService);
}