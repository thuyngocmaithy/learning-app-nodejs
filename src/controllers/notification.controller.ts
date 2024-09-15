import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Notification } from '../entities/Notification';
import { UserService } from '../services/User.service';

export class NotificationController {
  private notificationService: NotificationService;
  private userService: UserService;

  constructor(dataSource: DataSource) {
    this.notificationService = new NotificationService(dataSource);
    this.userService = new UserService(dataSource);
  }

  public getAllNotifications = (req: Request, res: Response) => RequestHandler.getAll<Notification>(req, res, this.notificationService);
  public getNotificationById = (req: Request, res: Response) => RequestHandler.getById<Notification>(req, res, this.notificationService);
  public createNotification = (req: Request, res: Response) => RequestHandler.create<Notification>(req, res, this.notificationService);
  public updateNotification = (req: Request, res: Response) => RequestHandler.update<Notification>(req, res, this.notificationService);
  public deleteNotification = (req: Request, res: Response) => RequestHandler.delete(req, res, this.notificationService);

  public getNotificationByUserId = async (req: Request, res: Response) => {
    try {
      const userId = req.query.user as string | undefined;

      if (!userId) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const scientificResearchUser = await this.notificationService.getByUserId(userId);
      return res.status(200).json({ message: 'success', data: scientificResearchUser });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };
}