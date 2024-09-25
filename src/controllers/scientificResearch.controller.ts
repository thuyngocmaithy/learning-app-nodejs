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
  public getPermissionFeatureWhere = (req: Request, res: Response) => RequestHandler.getWhere<ScientificResearch>(req, res, this.scientificResearchService);
  public createScientificResearch = (req: Request, res: Response) => RequestHandler.create<ScientificResearch>(req, res, this.scientificResearchService);
  public updateScientificResearch = (req: Request, res: Response) => RequestHandler.update<ScientificResearch>(req, res, this.scientificResearchService);
  public deleteScientificResearch = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchService);

  public getByScientificResearchIGroupId = async (req: Request, res: Response) => {
    try {
      const scientificResearchGroupId = req.query.SRGId as string;

      const data = await this.scientificResearchService.getByScientificResearchGroupId(scientificResearchGroupId);

      return res.status(200).json({ message: 'success', data: data });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };

  public getBySRGIdAndCheckApprove = async (req: Request, res: Response) => {
    try {
      const SRGId = req.query.SRGId as string;
      const userId = req.query.userId as string;

      const data = await this.scientificResearchService.getBySRGIdAndCheckApprove(SRGId, userId);

      return res.status(200).json({ message: 'success', data: data });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };
}
