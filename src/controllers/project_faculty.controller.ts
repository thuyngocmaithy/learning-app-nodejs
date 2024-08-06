import { Request, Response } from 'express';
import { Project_FacultyService } from '../services/project_faculty.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Project_Faculty } from '../entities/Project_Faculty';

export class Project_FacultyController {
  private projectFacultyService: Project_FacultyService;

  constructor(dataSource: DataSource) {
    this.projectFacultyService = new Project_FacultyService(dataSource);
  }

  public getAllProjectFaculties = (req: Request, res: Response) => RequestHandler.getAll<Project_Faculty>(req, res, this.projectFacultyService);
  public getProjectFacultyById = (req: Request, res: Response) => RequestHandler.getById<Project_Faculty>(req, res, this.projectFacultyService);
  public createProjectFaculty = (req: Request, res: Response) => RequestHandler.create<Project_Faculty>(req, res, this.projectFacultyService);
  public updateProjectFaculty = (req: Request, res: Response) => RequestHandler.update<Project_Faculty>(req, res, this.projectFacultyService);
  public deleteProjectFaculty = (req: Request, res: Response) => RequestHandler.delete(req, res, this.projectFacultyService);
}