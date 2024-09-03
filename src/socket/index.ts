import { Server } from 'socket.io';
import { setupNotificationSocket } from './notificationSocket';
import { setupMessageSocket } from './messageSocket';

export const setupSockets = (io: Server) => {
    setupNotificationSocket(io);
    setupMessageSocket(io);
};
