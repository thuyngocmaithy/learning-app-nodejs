// import express from 'express';
// import { getConversations, getMessages, sendMessage, createConversation } from '../controllers/chat/chat.controller';
// import { authMiddleware } from '../middlewares/auth.middlewares';

// const router = express.Router();

// // Áp dụng middleware xác thực cho tất cả các routes
// router.use(authMiddleware);

// // Routes cho conversation
// router.get('/conversations', getConversations);
// router.post('/conversations', createConversation);

// // Routes cho messages
// router.get('/conversations/:conversationId/messages', getMessages);
// router.post('/conversations/:conversationId/messages', sendMessage);

// export default router;