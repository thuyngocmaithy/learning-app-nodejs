import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Message } from '../entities/Message';

export class MessageController {
  private messageService: MessageService;

  constructor(dataSource: DataSource) {
    this.messageService = new MessageService(dataSource);
  }

  public getAllMessages = (req: Request, res: Response) => RequestHandler.getAll<Message>(req, res, this.messageService);
  public getMessageById = (req: Request, res: Response) => RequestHandler.getById<Message>(req, res, this.messageService);
  public createMessage = (req: Request, res: Response) => RequestHandler.create<Message>(req, res, this.messageService);
  public updateMessage = (req: Request, res: Response) => RequestHandler.update<Message>(req, res, this.messageService);
  public deleteMessage = (req: Request, res: Response) => RequestHandler.delete(req, res, this.messageService);
}