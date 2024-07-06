import Conversation, { IConversation } from '../models/conversation.model';
import { Types } from 'mongoose';

class ConversationService {
  async getConversations(userId: string): Promise<IConversation[]> {
    return Conversation.find({ participants: userId })
      .populate('participants', 'name email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
  }

  async createConversation(participants: string[], type: 'user-admin' | 'user-user'): Promise<IConversation> {
    const conversation = new Conversation({
      participants,
      type
    });
    return conversation.save();
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messageId,
      $set: { updatedAt: new Date() }
    });
  }
}

export default new ConversationService();