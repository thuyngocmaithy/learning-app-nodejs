import { Request, Response } from 'express';
import { AttachService } from '../services/attach.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Attach } from '../entities/Attach';

export class AttachController {
  private attachService: AttachService;

  constructor(dataSource: DataSource) {
    this.attachService = new AttachService(dataSource);
  }

  public getAllAttachments = (req: Request, res: Response) => RequestHandler.getAll<Attach>(req, res, this.attachService);
  public getAttachmentById = (req: Request, res: Response) => RequestHandler.getById<Attach>(req, res, this.attachService);
  public createAttachment = (req: Request, res: Response) => RequestHandler.create<Attach>(req, res, this.attachService);
  public updateAttachment = (req: Request, res: Response) => RequestHandler.update<Attach>(req, res, this.attachService);
  public deleteAttachment = (req: Request, res: Response) => RequestHandler.delete(req, res, this.attachService);
  public getAttachmentWhere = (req: Request, res: Response) => RequestHandler.getWhere<Attach>(req, res, this.attachService);
}