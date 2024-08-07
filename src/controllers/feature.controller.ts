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
  public createFeature = (req: Request, res: Response) => RequestHandler.create<Feature>(req, res, this.featureService);
  public updateFeature = (req: Request, res: Response) => RequestHandler.update<Feature>(req, res, this.featureService);
  public deleteFeature = (req: Request, res: Response) => RequestHandler.delete(req, res, this.featureService);
}