// src/controllers/follower-detail.controller.ts
import { Request, Response } from 'express';
import { FollowerDetailService } from '../services/followerDetail.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { FollowerDetail } from '../entities/Follower';

export class FollowerDetailController {
  private followerDetailService: FollowerDetailService;

  constructor(dataSource: DataSource) {
    this.followerDetailService = new FollowerDetailService(dataSource);
  }

  public getAllFollowerDetails = (req: Request, res: Response) => RequestHandler.getAll<FollowerDetail>(req, res, this.followerDetailService);
  public getFollowerDetailById = (req: Request, res: Response) => RequestHandler.getById<FollowerDetail>(req, res, this.followerDetailService);
  public createFollowerDetail = (req: Request, res: Response) => RequestHandler.create<FollowerDetail>(req, res, this.followerDetailService);
  public updateFollowerDetail = (req: Request, res: Response) => RequestHandler.update<FollowerDetail>(req, res, this.followerDetailService);
  public deleteFollowerDetail = (req: Request, res: Response) => RequestHandler.delete(req, res, this.followerDetailService);


}
