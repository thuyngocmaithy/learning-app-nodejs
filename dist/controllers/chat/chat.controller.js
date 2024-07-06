"use strict";
// import { Request, Response } from 'express';
// import ConversationService from '../../services/conversationService';
// import MessageService from '../../services/messageService';
// export const getConversations = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user._id; // Giả sử bạn đã có middleware xác thực
//     const conversations = await ConversationService.getConversations(userId);
//     res.json(conversations);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching conversations' });
//   }
// };
// export const getMessages = async (req: Request, res: Response) => {
//   try {
//     const { conversationId } = req.params;
//     const messages = await MessageService.getMessages(conversationId);
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching messages' });
//   }
// };
// export const sendMessage = async (req: Request, res: Response) => {
//   try {
//     const { conversationId, content } = req.body;
//     const senderId = req.user._id; // Giả sử bạn đã có middleware xác thực
//     const message = await MessageService.createMessage(conversationId, senderId, content);
//     await ConversationService.updateLastMessage(conversationId, message._id);
//     res.status(201).json(message);
//   } catch (error) {
//     res.status(500).json({ message: 'Error sending message' });
//   }
// };
// export const createConversation = async (req: Request, res: Response) => {
//   try {
//     const { participantId, type } = req.body;
//     const userId = req.user._id;
//     const conversation = await ConversationService.createConversation([userId, participantId], type);
//     res.status(201).json(conversation);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating conversation' });
//   }
// };
