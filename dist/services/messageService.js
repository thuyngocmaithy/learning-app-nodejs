"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_model_1 = __importDefault(require("../models/message.model"));
class MessageService {
    async getMessages(conversationId) {
        return message_model_1.default.find({ conversation: conversationId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });
    }
    async createMessage(conversationId, senderId, content) {
        const message = new message_model_1.default({
            conversation: conversationId,
            sender: senderId,
            content
        });
        return message.save();
    }
    async markAsRead(messageId, userId) {
        await message_model_1.default.findByIdAndUpdate(messageId, {
            $addToSet: { readBy: userId }
        });
    }
}
exports.default = new MessageService();
