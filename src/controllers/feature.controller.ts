// feature.controller.ts
import { Request, Response } from 'express';
import { FeatureService } from '../services/feature.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Feature } from '../entities/Feature';

export class FeatureController {
  private featureService: FeatureService;

  constructor(dataSource: DataSource) {
    this.featureService = new FeatureService(dataSource);
  }

  public getAllFeatures = (req: Request, res: Response) => RequestHandler.getAll<Feature>(req, res, this.featureService);
  public getFeatureById = (req: Request, res: Response) => RequestHandler.getById<Feature>(req, res, this.featureService);
  public getFeatureWhereParentAndKeyRoute = (req: Request, res: Response) => RequestHandler.getWhere<Feature>(req, res, this.featureService);
  public createFeature = (req: Request, res: Response) => RequestHandler.create<Feature>(req, res, this.featureService);
  public updateFeature = (req: Request, res: Response) => RequestHandler.update<Feature>(req, res, this.featureService);
  public deleteFeature = (req: Request, res: Response) => RequestHandler.delete(req, res, this.featureService);

  public GetFeatureByStructure = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.featureService.GetFeatureByStructure();
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No data found for GetFeatureByStructure' });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error('Error in GetFeatureByStructure:', error);
      res.status(500).json({
        error: 'Error executing stored procedure GetFeatureByStructure',
      });
    }
  }

  public GetFeatureByPermisison = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissionId = req.query.permission as string;
      if (!permissionId) {
        res.status(400).json({ message: 'Permission ID is required' });
        return;
      }

      const result = await this.featureService.GetFeatureByPermission(permissionId);
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No data found for GetFeatureByPermission' });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error('Error in GetFeatureByPermission:', error);
      res.status(500).json({
        error: 'Error executing stored procedure GetMenuUser',
      });
    }
  }
}