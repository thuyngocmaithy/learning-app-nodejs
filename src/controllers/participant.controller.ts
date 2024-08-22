import { Request, Response } from 'express';
import { ParticipantService } from '../services/participant.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Participant } from '../entities/Participant';

export class ParticipantController {
  private participantService: ParticipantService;

  constructor(dataSource: DataSource) {
    this.participantService = new ParticipantService(dataSource);
  }

  public getAllParticipants = (req: Request, res: Response) => RequestHandler.getAll<Participant>(req, res, this.participantService);
  public getParticipantById = (req: Request, res: Response) => RequestHandler.getById<Participant>(req, res, this.participantService);
  public createParticipant = (req: Request, res: Response) => RequestHandler.create<Participant>(req, res, this.participantService);
  public updateParticipant = (req: Request, res: Response) => RequestHandler.update<Participant>(req, res, this.participantService);
  public deleteParticipant = (req: Request, res: Response) => RequestHandler.delete(req, res, this.participantService);
}