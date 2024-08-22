import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Conversation } from '../entities/Conversation';

export class ConversationController {
  private conversationService: ConversationService;

  constructor(dataSource: DataSource) {
    this.conversationService = new ConversationService(dataSource);
  }

  public getAllConversations = (req: Request, res: Response) => RequestHandler.getAll<Conversation>(req, res, this.conversationService);
  public getConversationById = (req: Request, res: Response) => RequestHandler.getById<Conversation>(req, res, this.conversationService);
  public createConversation = (req: Request, res: Response) => RequestHandler.create<Conversation>(req, res, this.conversationService);
  public updateConversation = (req: Request, res: Response) => RequestHandler.update<Conversation>(req, res, this.conversationService);
  public deleteConversation = (req: Request, res: Response) => RequestHandler.delete(req, res, this.conversationService);
}