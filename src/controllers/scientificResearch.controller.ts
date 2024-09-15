// scientificResearch.controller.ts
import { Request, Response } from 'express';
import { ScientificResearchService } from '../services/scientificResearch.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearch } from '../entities/ScientificResearch';

export class ScientificResearchController {
  private scientificResearchService: ScientificResearchService;

  constructor(dataSource: DataSource) {
    this.scientificResearchService = new ScientificResearchService(dataSource);
  }

  public getAllScientificResearchs = (req: Request, res: Response) => RequestHandler.getAll<ScientificResearch>(req, res, this.scientificResearchService);
  public getScientificResearchById = (req: Request, res: Response) => RequestHandler.getById<ScientificResearch>(req, res, this.scientificResearchService);
  public createScientificResearch = (req: Request, res: Response) => RequestHandler.create<ScientificResearch>(req, res, this.scientificResearchService);
  public updateScientificResearch = (req: Request, res: Response) => RequestHandler.update<ScientificResearch>(req, res, this.scientificResearchService);
  public deleteScientificResearch = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchService);
}
