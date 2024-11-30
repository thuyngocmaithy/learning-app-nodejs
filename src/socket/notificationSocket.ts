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
                // Kiểm tra nếu url === /DeTaiNCKH/DeTaiNCKHThamGia hoặc /DeTaiKhoaLuan/DeTaiKhoaLuanThamGia
                // => Update các thông báo có cùng url trước đó thành disable = 1
                const urlCheck = notificationData.url;
                const urlPath = urlCheck.split('?')[0];
                let disabledNotifications: any = [];

                if (urlPath === '/DeTaiNCKH/DeTaiNCKHThamGia' || '/DeTaiKhoaLuan/DeTaiKhoaLuanThamGia') {
                    // Tìm các thông báo có cùng url
                    const listNotiUpdate = await notificationService.getWhere({ url: urlCheck });
                    if (listNotiUpdate.length > 0) {
                        // Cập nhật tất cả các thông báo tìm được
                        disabledNotifications = await Promise.all(
                            listNotiUpdate.map(async (noti) => {
                                noti.disabled = true; // Đặt disabled = true
                                await notificationService.update(noti.id, { disabled: true });
                                return noti; // Lưu thông báo đã cập nhật
                            })
                        );
                    }
                }

                const createdNotification = await notificationService.create(notificationData)
                // Gửi thông báo mới và danh sách thông báo bị ẩn
                notificationIo.to(room).emit('receiveNotification', {
                    newNotification: createdNotification,
                    disabledNotifications,
                });
            } catch (error) {
                console.error('Lỗi khi gửi thông báo:', error);
            }
        });

        //Xóa thông báo
        socket.on('deleteNotification', async ({ room, deleteNotification }: { room: string; deleteNotification: Notification }) => {
            try {
                const notiFind = await notificationService.getWhere({ toUser: deleteNotification.toUser, createUser: deleteNotification.createUser, title: deleteNotification.title });
                if (notiFind) {
                    await notificationService.delete([notiFind[0].id]);
                    notificationIo.to(room).emit('notificationDeleted', notiFind[0].id);
                    console.log(`Thông báo ${notiFind[0].id} đã bị xóa`);
                }

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
