import { Server, Socket } from 'socket.io';
import { MessageService } from '../services/message.service';
import { AppDataSource } from '../data-source';
import { Message } from '../entities/Message';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { ScientificResearch } from '../entities/ScientificResearch';
import { Thesis } from '../entities/Thesis';

export const setupMessageSocket = (io: Server) => {
    const dataSource: DataSource = AppDataSource;
    const messageService = new MessageService(AppDataSource);
    const userRepository = dataSource.getRepository(User);
    const srRepository = dataSource.getRepository(ScientificResearch);
    const thesisRepository = dataSource.getRepository(Thesis);

    // Tạo namespace cho message
    const messageIo = io.of('/messages');

    messageIo.on('connection', (socket: Socket) => {
        console.log('Người dùng đã kết nối (message): ', socket.id);


        // Lắng nghe sự kiện joinRoom để thêm socket vào một room cụ thể
        socket.on('joinRoom', (room: string) => {
            socket.join(room);
            console.warn(`Socket id ${socket.id} đã tham gia room ${room}`);
        });

        // Lắng nghe sự kiện sendMessage để gửi tin nhắn đến các room cụ thể
        socket.on('sendMessage', async ({ room, messageContent, senderId }: { room: string; messageContent: string, senderId: string }) => {
            try {
                const user = await userRepository.findOneBy({ userId: senderId as string });
                if (!user) {
                    console.error("messageSocket: Not found entity user");
                    return;
                }

                var messageEntity = new Message();
                messageEntity.content = messageContent;
                messageEntity.sender = user;

                const SR = await srRepository.findOneBy({ scientificResearchId: room as string });
                if (SR) {
                    messageEntity.scientificResearch = SR;
                } else {
                    const thesis = await thesisRepository.findOneBy({ thesisId: room as string });
                    if (thesis) {
                        messageEntity.thesis = thesis;
                    } else {
                        console.error("Room không tồn tại trong cả scientificResearch và thesis.");
                        return;
                    }
                }

                const createdMessage = await messageService.create(messageEntity)
                messageIo.to(room).emit('receiveMessage', createdMessage);
            } catch (error) {
                console.error('Lỗi khi gửi thông báo:', error);
            }
        });

        // Xử lý yêu cầu lấy danh sách message theo SRId và thesisId
        socket.on('getMessages', async (id) => {
            try {
                let messages;
                if (id.key === 'srId') {
                    messages = await messageService.getWhere({ SRId: id.value });
                    messageIo.to(id.value).emit('messagesList', id.value, messages);
                }
                if (id.key === 'thesisId') {
                    messages = await messageService.getWhere({ thesisId: id.value });
                    messageIo.to(id.value).emit('messagesList', id.value, messages);
                }
            } catch (error) {
                console.error('Lỗi khi lấy messages:', error);
                socket.emit('messagesList', []);
            }
        });

        socket.on('disconnect', () => {
            console.log('Người dùng đã ngắt kết nối (message): ', socket.id);
        });
    });
};
