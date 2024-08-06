// project.controller.ts
import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Project } from '../entities/Project';

export class ProjectController {
  private projectService: ProjectService;

  constructor(dataSource: DataSource) {
    this.projectService = new ProjectService(dataSource);
  }

  public getAllProjects = (req: Request, res: Response) => RequestHandler.getAll<Project>(req, res, this.projectService);
  public getProjectById = (req: Request, res: Response) => RequestHandler.getById<Project>(req, res, this.projectService);
  public createProject = (req: Request, res: Response) => RequestHandler.create<Project>(req, res, this.projectService);
  public updateProject = (req: Request, res: Response) => RequestHandler.update<Project>(req, res, this.projectService);
  public deleteProject = (req: Request, res: Response) => RequestHandler.delete(req, res, this.projectService);
}
