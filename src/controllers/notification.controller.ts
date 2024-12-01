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
	public getNotificationWhere = (req: Request, res: Response) => RequestHandler.getWhere<Notification>(req, res, this.notificationService);
	public getNotificationWhereFilter = (req: Request, res: Response) => RequestHandler.getWhereFilter<Notification>(req, res, this.notificationService);
	public createNotification = (req: Request, res: Response) => RequestHandler.create<Notification>(req, res, this.notificationService);
	public updateNotification = (req: Request, res: Response) => RequestHandler.update<Notification>(req, res, this.notificationService);
	public deleteNotification = (req: Request, res: Response) => RequestHandler.delete(req, res, this.notificationService);
	public updateNotificationMulti = (req: Request, res: Response) => RequestHandler.updateMulti<Notification>(req, res, this.notificationService);


	public getNotificationByUserId = async (req: Request, res: Response) => {
		try {
			// Lấy userId từ query string
			const userId = req.query.user as string | undefined;

			// Kiểm tra xem userId có được cung cấp không
			if (!userId) {
				return res.status(400).json({ message: 'User ID is required' });
			}

			// Gọi service để lấy thông báo
			const notifications = await this.notificationService.getByUserId(userId);

			// Kiểm tra nếu không có thông báo nào
			if (notifications.length === 0) {
				return res.status(404).json({ message: 'No notifications found for this user' });
			}

			// Trả về kết quả thành công với dữ liệu thông báo
			return res.status(200).json({ message: 'success', data: notifications });
		} catch (error) {
			// Xử lý lỗi server
			const err = error as Error;
			return res.status(500).json({ message: 'An error occurred', error: err.message });
		}
	};

}