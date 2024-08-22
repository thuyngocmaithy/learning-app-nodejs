// src/routes/conversationRoutes.ts
import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { AppDataSource } from '../data-source';


const conversationRouter = Router();
const conversationController = new ConversationController(AppDataSource);

conversationRouter.get('/', conversationController.getAllConversations);
conversationRouter.get('/:id', conversationController.getConversationById);
conversationRouter.post('/', conversationController.createConversation);
conversationRouter.put('/:id', conversationController.updateConversation);
conversationRouter.delete('/:id', conversationController.deleteConversation);

export default conversationRouter;
