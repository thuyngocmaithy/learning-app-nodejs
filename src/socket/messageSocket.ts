import { Server, Socket } from 'socket.io';

export const setupMessageSocket = (io: Server) => {
    const messageIo = io.of('/messages');

    messageIo.on('connection', (socket: Socket) => {
        console.log('Người dùng đã kết nối (message)');

        // Lắng nghe sự kiện sendMessage trong namespace này
        socket.on('sendMessage', (message: string) => {
            console.log('Nhận tin nhắn:', message);
            messageIo.emit('message', message); // Phát tin nhắn đến tất cả các kết nối trong namespace này
        });

        socket.on('disconnect', () => {
            console.log('Người dùng đã ngắt kết nối (message)');
        });
    });
};
