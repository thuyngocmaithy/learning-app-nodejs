import { Request, Response } from 'express';
import { ScientificResearchGroupService } from '../services/scientificResearchGroup.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';

export class ScientificResearchGroupController {
  private scientificResearchGroupService: ScientificResearchGroupService;

  constructor(dataSource: DataSource) {
    this.scientificResearchGroupService = new ScientificResearchGroupService(dataSource);
  }

  public getAllScientificResearchGroups = (req: Request, res: Response) => RequestHandler.getAll<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public getScientificResearchGroupById = (req: Request, res: Response) => RequestHandler.getById<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public createScientificResearchGroup = (req: Request, res: Response) => RequestHandler.create<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public updateScientificResearchGroup = (req: Request, res: Response) => RequestHandler.update<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public deleteScientificResearchGroup = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchGroupService);
  public getSRGWhere = (req: Request, res: Response) => RequestHandler.getWhere<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
}
