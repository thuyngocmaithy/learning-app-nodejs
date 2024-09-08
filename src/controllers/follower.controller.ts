import { Request, Response } from 'express';
import { FollowerService } from '../services/follower.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Follower } from '../entities/Follower';
import { ProjectService } from '../services/project.service';
export class FollowerController {
  private followerService: FollowerService;

  constructor(dataSource: DataSource) {
    this.followerService = new FollowerService(dataSource);
  }

  public getAllFollowers = (req: Request, res: Response) => RequestHandler.getAll<Follower>(req, res, this.followerService);
  public getFollowerById = (req: Request, res: Response) => RequestHandler.getById<Follower>(req, res, this.followerService);
  public createFollower = (req: Request, res: Response) => RequestHandler.create<Follower>(req, res, this.followerService);
  public updateFollower = (req: Request, res: Response) => RequestHandler.update<Follower>(req, res, this.followerService);
  public deleteFollower = (req: Request, res: Response) => RequestHandler.delete(req, res, this.followerService);

  public getFollowerByProjectId = async (req: Request, res: Response) => {
    try {
      const projectId = req.query.project as string;

      const follower = await this.followerService.getByProjectId(projectId);

      return res.status(200).json({ message: 'success', data: follower });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };

}
