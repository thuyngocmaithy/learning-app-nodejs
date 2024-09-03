import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../data-source';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../entities/Notification';

export const setupNotificationSocket = (io: Server) => {
    const notificationService = new NotificationService(AppDataSource);
    // Tạo namespace cho thông báo
    const notificationIo = io.of('/notifications');

    notificationIo.on('connection', (socket: Socket) => {
        console.log('Người dùng đã kết nối (notification):', socket.id);

        // Lắng nghe sự kiện joinRoom để thêm socket vào một room cụ thể
        socket.on('joinRoom', (room: string) => {
            socket.join(room);
            console.log(`Socket id ${socket.id} đã tham gia room ${room}`);
        });

        // Lắng nghe sự kiện sendNotification để gửi thông báo đến các room cụ thể
        socket.on('sendNotification', async ({ room, notificationData }: { room: string; notificationData: Notification }) => {
            try {
                const createdNotification = await notificationService.create(notificationData)
                notificationIo.to(room).emit('receiveNotification', createdNotification);
            } catch (error) {
                console.error('Lỗi khi gửi thông báo:', error);
            }
        });

        //Xóa thông báo
        socket.on('deleteNotification', async ({ room, deleteNotification }: { room: string; deleteNotification: Notification }) => {
            try {
                const notiFind = await notificationService.getWhere({ toUser: deleteNotification.toUser, createUser: deleteNotification.createUser, content: deleteNotification.content });
                await notificationService.delete(notiFind[0].id);
                notificationIo.to(room).emit('notificationDeleted', notiFind[0].id);
                console.log(`Thông báo ${notiFind[0].id} đã bị xóa`);
            } catch (error) {
                console.error('Lỗi khi xóa thông báo:', error);
            }
        });

        // Xử lý yêu cầu lấy danh sách thông báo theo userId
        socket.on('getNotifications', async (userId: string) => {
            try {
                const notifications = await notificationService.getByUserId(userId);
                socket.emit('notificationsList', notifications);
            } catch (error) {
                console.error('Lỗi khi lấy thông báo:', error);
                socket.emit('notificationsList', []);
            }
        });

        // Xử lý sự kiện ngắt kết nối
        socket.on('disconnect', () => {
            console.log('Người dùng đã ngắt kết nối (notification):', socket.id);
        });
    });
};
