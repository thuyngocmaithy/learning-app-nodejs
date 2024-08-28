import { Request, Response } from 'express';
import { PermissionFeatureService } from '../services/perrmission_feature.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { PermissionFeature } from '../entities/Permission_Feature';

export class PermissionFeatureController {
  private permissionFeatureService: PermissionFeatureService;

  constructor(dataSource: DataSource) {
    this.permissionFeatureService = new PermissionFeatureService(dataSource);
  }

  public getAllPermissionFeatures = (req: Request, res: Response) => RequestHandler.getAll<PermissionFeature>(req, res, this.permissionFeatureService);
  public getPermissionFeatureById = (req: Request, res: Response) => RequestHandler.getById<PermissionFeature>(req, res, this.permissionFeatureService);
  public getPermissionFeatureWhere = (req: Request, res: Response) => RequestHandler.getWhere<PermissionFeature>(req, res, this.permissionFeatureService);
  public createPermissionFeature = (req: Request, res: Response) => RequestHandler.create<PermissionFeature>(req, res, this.permissionFeatureService);
  public updatePermissionFeature = (req: Request, res: Response) => RequestHandler.update<PermissionFeature>(req, res, this.permissionFeatureService);
  public deletePermissionFeature = (req: Request, res: Response) => RequestHandler.delete(req, res, this.permissionFeatureService);
}