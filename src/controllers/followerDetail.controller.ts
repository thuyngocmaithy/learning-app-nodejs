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
  public updateFollowerDetail = (req: Request, res: Response) => RequestHandler.update<FollowerDetail>(req, res, this.followerDetailService);
  public deleteFollowerDetail = (req: Request, res: Response) => RequestHandler.delete(req, res, this.followerDetailService);

  public createFollowerDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Lấy dữ liệu từ body của yêu cầu
      const data = req.body;

      // Gọi hàm create từ service
      await this.followerDetailService.create(data);

      // Trả về phản hồi thành công
      return res.status(200).json({ message: 'success', data: 'Lưu thành công' });
    } catch (error) {
      console.error('Error creating FollowerDetail:', error);
      // Trả về phản hồi lỗi
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  }

  public deleteFollowerDetailBySRIdAndUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const srId = req.query.srId as string;
      const userId = req.query.userId as string;

      await this.followerDetailService.deleteBySRIdAndUserId(srId, userId);

      // Trả về phản hồi thành công
      return res.status(200).json({ message: 'success', data: 'Xóa thành công' });
    } catch (error) {
      console.error('Error delete FollowerDetail:', error);
      // Trả về phản hồi lỗi
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  }

}
