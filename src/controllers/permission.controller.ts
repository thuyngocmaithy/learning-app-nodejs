import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Permission } from '../entities/Permission';

export class PermissionController {
  private permissionService: PermissionService;

  constructor(dataSource: DataSource) {
    this.permissionService = new PermissionService(dataSource);
  }

  public getAllPermissions = (req: Request, res: Response) => RequestHandler.getAll<Permission>(req, res, this.permissionService);
  public getPermissionByPermissionId = (req: Request, res: Response) => RequestHandler.getById<Permission>(req, res, this.permissionService);
  public createPermission = (req: Request, res: Response) => RequestHandler.create<Permission>(req, res, this.permissionService);
  public updatePermission = (req: Request, res: Response) => RequestHandler.update<Permission>(req, res, this.permissionService);
  public deletePermission = (req: Request, res: Response) => RequestHandler.delete(req, res, this.permissionService);
}