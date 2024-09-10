import { Request, Response } from 'express';
import { Project_UserService } from '../services/project_user.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Project_User } from '../entities/Project_User';
import { UserService } from '../services/User.service';
import { ProjectService } from '../services/project.service';

export class Project_UserController {
  private projectUserService: Project_UserService;
  private userService: UserService;
  private projectService: ProjectService;

  constructor(dataSource: DataSource) {
    this.projectUserService = new Project_UserService(dataSource);
    this.userService = new UserService(dataSource);
    this.projectService = new ProjectService(dataSource);
  }

  public getAllProjectUser = (req: Request, res: Response) => RequestHandler.getAll<Project_User>(req, res, this.projectUserService);
  public getProjectUserById = (req: Request, res: Response) => RequestHandler.getById<Project_User>(req, res, this.projectUserService);
  public createProjectUser = (req: Request, res: Response) => RequestHandler.create<Project_User>(req, res, this.projectUserService);
  public updateProjectUser = (req: Request, res: Response) => RequestHandler.update<Project_User>(req, res, this.projectUserService);
  public deleteProjectUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.projectUserService);


  //lấy ProjectUser có group cao nhất
  public getHighestGroupProjectUser = (req: Request, res: Response) => {
    this.projectUserService.getHighestGroupProjectUser()
      .then(projectUser => res.status(200).json({ message: 'success', data: projectUser }))
      .catch(error => res.status(500).json({ message: 'error', error: error.message }));
  };

  public getProjectUserByUserId = async (req: Request, res: Response) => {
    try {
      const userId = req.query.user as string | undefined;

      if (!userId) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await this.userService.getByUserId(userId);  // Fetch the User entity by ID

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const projectUser = await this.projectUserService.getByUserId(user);
      return res.status(200).json({ message: 'success', data: projectUser });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };

  public getProjectUserByProjectId = async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project as string | undefined;

      if (!projectId) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }

      const project = await this.projectService.getById(projectId);  // Fetch the User entity by ID

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const projectUser = await this.projectUserService.getByProjectId(project);

      return res.status(200).json({ message: 'success', data: projectUser });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };

  // Delete Project_User by user and project
  public deleteProjectUserByUserAndProject = async (req: Request, res: Response) => {
    try {
      const userId = req.query.user as string | undefined;
      const projectId = req.query.project as string | undefined;

      if (!userId || !projectId) {
        return res.status(400).json({ message: 'Invalid user ID or project ID' });
      }

      const user = await this.userService.getByUserId(userId);
      const project = await this.projectService.getById(projectId); // Fetch the Project entity by ID

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const deletionResult = await this.projectUserService.deleteByUserAndProject(user, project);

      if (deletionResult) {
        return res.status(200).json({ message: 'success', data: 'Xóa thành công' });
      } else {
        return res.status(404).json({ message: 'Record not found' });
      }
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };
}