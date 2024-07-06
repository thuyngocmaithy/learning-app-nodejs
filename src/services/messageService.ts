import Message, { IMessage } from '../models/message.model';
import { Types } from 'mongoose';

class MessageService {
  async getMessages(conversationId: string): Promise<IMessage[]> {
    return Message.find({ conversation: conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
  }

  async createMessage(conversationId: string, senderId: string, content: string): Promise<IMessage> {
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      content
    });
    return message.save();
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: userId }
    });
  }
}

export default new MessageService();