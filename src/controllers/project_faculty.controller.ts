import { Request, Response } from 'express';
import { Project_UserService } from '../services/project_user.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Project_User } from '../entities/Project_User';

export class Project_UserController {
  private projectUserService: Project_UserService;

  constructor(dataSource: DataSource) {
    this.projectUserService = new Project_UserService(dataSource);
  }

  public getAllProjectUser = (req: Request, res: Response) => RequestHandler.getAll<Project_User>(req, res, this.projectUserService);
  public getProjectUserById = (req: Request, res: Response) => RequestHandler.getById<Project_User>(req, res, this.projectUserService);
  public createProjectUser = (req: Request, res: Response) => RequestHandler.create<Project_User>(req, res, this.projectUserService);
  public updateProjectUser = (req: Request, res: Response) => RequestHandler.update<Project_User>(req, res, this.projectUserService);
  public deleteProjectUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.projectUserService);
}