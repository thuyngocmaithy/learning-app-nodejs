import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { AppDataSource } from '../data-source';


const notificationRouter = Router();
const notificationController = new NotificationController(AppDataSource);

notificationRouter.get('/', notificationController.getAllNotifications);
notificationRouter.get('/getByUserId', notificationController.getNotificationByUserId);
notificationRouter.get('/:id', notificationController.getNotificationById);
notificationRouter.post('/', notificationController.createNotification);
notificationRouter.put('/:id', notificationController.updateNotification);
notificationRouter.delete('/:id', notificationController.deleteNotification);

export default notificationRouter;
