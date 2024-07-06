"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
class ConversationService {
    async getConversations(userId) {
        return conversation_model_1.default.find({ participants: userId })
            .populate('participants', 'name email')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
    }
    async createConversation(participants, type) {
        const conversation = new conversation_model_1.default({
            participants,
            type
        });
        return conversation.save();
    }
    async updateLastMessage(conversationId, messageId) {
        await conversation_model_1.default.findByIdAndUpdate(conversationId, {
            lastMessage: messageId,
            $set: { updatedAt: new Date() }
        });
    }
}
exports.default = new ConversationService();
