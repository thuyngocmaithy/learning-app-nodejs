import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { AppDataSource } from '../data-source';


const messageRouter = Router();
const messageController = new MessageController(AppDataSource);

messageRouter.get('/', messageController.getAllMessages);
messageRouter.get('/:id', messageController.getMessageById);
messageRouter.post('/', messageController.createMessage);
messageRouter.put('/:id', messageController.updateMessage);
messageRouter.delete('/:id', messageController.deleteMessage);

export default messageRouter;
