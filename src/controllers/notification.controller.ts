import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Notification } from '../entities/Notification';

export class NotificationController {
  private notificationService: NotificationService;

  constructor(dataSource: DataSource) {
    this.notificationService = new NotificationService(dataSource);
  }

  public getAllNotifications = (req: Request, res: Response) => RequestHandler.getAll<Notification>(req, res, this.notificationService);
  public getNotificationById = (req: Request, res: Response) => RequestHandler.getById<Notification>(req, res, this.notificationService);
  public createNotification = (req: Request, res: Response) => RequestHandler.create<Notification>(req, res, this.notificationService);
  public updateNotification = (req: Request, res: Response) => RequestHandler.update<Notification>(req, res, this.notificationService);
  public deleteNotification = (req: Request, res: Response) => RequestHandler.delete(req, res, this.notificationService);
}