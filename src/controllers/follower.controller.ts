import { Request, Response } from 'express';
import { FollowerService } from '../services/follower.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Follower, FollowerDetail } from '../entities/Follower';
import { FollowerDetailService } from '../services/followerDetail.service';
import { UserService } from '../services/User.service';
import { User } from '../entities/User';
import { ScientificResearchGroupService } from '../services/scientificResearchGroup.service';

export class FollowerController {
  private followerService: FollowerService;
  private followerDetailService: FollowerDetailService;
  private userService: UserService;
  private scientificResearchGroupService: ScientificResearchGroupService;

  constructor(dataSource: DataSource) {
    this.followerService = new FollowerService(dataSource);
    this.followerDetailService = new FollowerDetailService(dataSource);
    this.userService = new UserService(dataSource);
    this.scientificResearchGroupService = new ScientificResearchGroupService(dataSource);
  }

  public getAllFollowers = (req: Request, res: Response) => RequestHandler.getAll<Follower>(req, res, this.followerService);
  public getFollowerById = (req: Request, res: Response) => RequestHandler.getById<Follower>(req, res, this.followerService);
  public createFollower = (req: Request, res: Response) => RequestHandler.create<Follower>(req, res, this.followerService);
  public updateFollower = (req: Request, res: Response) => RequestHandler.update<Follower>(req, res, this.followerService);
  public deleteFollower = (req: Request, res: Response) => RequestHandler.delete(req, res, this.followerService);

  public getFollowerByScientificResearchId = async (req: Request, res: Response) => {
    try {
      const scientificResearchId = req.query.scientificResearch as string;

      const follower = await this.followerService.getByScientificResearchId(scientificResearchId);

      return res.status(200).json({ message: 'success', data: follower });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };

  public getFollowersByUserIdAndSRGroupId = async (req: Request, res: Response) => {
    try {
      let user = null;
      let SRGroup = null;

      if (req.query.userId) {
        user = await this.userService.getById(req.query.userId as string);
      }
      if (req.query.srgroupId) {
        SRGroup = await this.scientificResearchGroupService.getById(req.query.srgroupId as string);
      }

      let followerDetail = null;
      let followers = null;

      if (user) {
        // Lấy danh sách FollowerDetail dựa trên userId
        followerDetail = await this.followerDetailService.getDetailsByUser(user);

        if (followerDetail && followerDetail.length > 0) {
          // Lấy danh sách followerId từ followerDetail
          const followerIds = followerDetail.map(detail => detail.follower.id);

          // Lấy danh sách follower theo danh sách followerIds
          followers = await this.followerService.getFollowersByUserIdAndSRGroupId(followerIds, SRGroup);
        }
      }

      return res.status(200).json({ message: 'success', data: followers });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };


}
