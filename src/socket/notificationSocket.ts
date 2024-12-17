import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../data-source';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../entities/Notification';

export const setupNotificationSocket = (io: Server) => {
    const notificationService = new NotificationService(AppDataSource);
    // Tạo namespace cho thông báo
    const notificationIo = io.of('/notifications');

    notificationIo.on('connection', (socket: Socket) => {
        // Lắng nghe sự kiện joinRoom để thêm socket vào một room cụ thể
        socket.on('joinRoom', (room: string) => {
            socket.join(room);
            console.warn(`Socket id ${socket.id} đã tham gia room ${room}`);
        });

        // Lắng nghe sự kiện sendNotification để gửi thông báo đến các room cụ thể
        socket.on('sendNotification', async ({ notificationData }: { notificationData: Notification }) => {
            try {
                // Kiểm tra nếu url === /DeTaiNCKH/DeTaiNCKHThamGia hoặc /DeTaiKhoaLuan/DeTaiKhoaLuanThamGia
                // => Xóa các thông báo có cùng url trước đó
                const urlCheck = notificationData.url;
                const urlPath = urlCheck.split('?')[0];
                let deletedNotificationIds: string[] = [];

                if (urlPath === '/DeTaiNCKH/DeTaiNCKHThamGia' || urlPath === '/DeTaiKhoaLuan/DeTaiKhoaLuanThamGia') {
                    // Tìm các thông báo có cùng url
                    const listNotiToDelete = await notificationService.getWhere({
                        url: urlCheck,
                        createUser: notificationData.createUser,
                        title: notificationData.title
                    });
                    if (listNotiToDelete.length > 0) {
                        // Xóa tất cả các thông báo tìm được
                        deletedNotificationIds = listNotiToDelete.map((item) => item.id);
                        await notificationService.delete(deletedNotificationIds); // Xóa thông báo
                    }
                }

                // Tạo thông báo mới
                const createdNotification = await notificationService.create(notificationData);

                // Gửi thông báo đến các user được chỉ định
                notificationData.toUsers.forEach((item) => {
                    // Gửi thông báo mới và danh sách ID thông báo đã xóa
                    notificationIo.to(`user-${item}`).emit('receiveNotification', {
                        newNotification: createdNotification,
                        deletedNotificationIds,
                    });
                });

            } catch (error) {
                console.error('Lỗi khi gửi thông báo:', error);
            }
        });


        //Xóa thông báo
        socket.on('deleteNotification', async ({ room, deleteNotification }: { room: string; deleteNotification: Notification }) => {
            try {
                // Tìm kiếm thông báo dựa trên các tiêu chí
                const notiFind = await notificationService.getWhere({
                    toUsers: deleteNotification.toUsers,
                    createUser: deleteNotification.createUser,
                    title: deleteNotification.title
                });

                // Kiểm tra nếu tìm thấy thông báo
                if (notiFind.length > 0) {
                    const notificationId = notiFind[0].id;

                    // Tiến hành xóa thông báo
                    const deleteSuccess = await notificationService.delete([notificationId]);

                    if (deleteSuccess) {
                        // Phát sự kiện thông báo đã bị xóa
                        notificationIo.to(room).emit('notificationDeleted', notificationId);
                        console.log(`Thông báo ${notificationId} đã bị xóa`);
                    } else {
                        console.log(`Không thể xóa thông báo ${notificationId}`);
                    }
                } else {
                    console.log('Không tìm thấy thông báo cần xóa');
                }
            } catch (error) {
                console.error('Lỗi khi xóa thông báo:', error);
            }
        });


        // Xử lý yêu cầu lấy danh sách thông báo theo userId
        socket.on('getNotifications', async (userId: string) => {
            try {
                if (userId) {
                    const notifications = await notificationService.getByUserId(userId);
                    socket.emit('notificationsList', notifications);
                }
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
