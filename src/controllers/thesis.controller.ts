import { Request, Response } from 'express';
import { ThesisService } from '../services/thesis.service';
import { RequestHandler } from '../utils/requestHandler';
import { Thesis } from '../entities/Thesis';
import { DataSource } from 'typeorm';

export class ThesisController {
  private thesisService: ThesisService;

  constructor(dataSource: DataSource) {
    this.thesisService = new ThesisService(dataSource);
  }

  public getAllTheses = (req: Request, res: Response) => RequestHandler.getAll<Thesis>(req, res, this.thesisService);
  public getThesisById = (req: Request, res: Response) => RequestHandler.getById<Thesis>(req, res, this.thesisService);
  public createThesis = (req: Request, res: Response) => RequestHandler.create<Thesis>(req, res, this.thesisService);
  public updateThesis = (req: Request, res: Response) => RequestHandler.update<Thesis>(req, res, this.thesisService);
  public deleteThesis = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisService);
}