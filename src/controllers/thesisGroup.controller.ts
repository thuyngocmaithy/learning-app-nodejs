import { Request, Response } from 'express';
import { ThesisGroupService } from '../services/thesisGroup.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ThesisGroup } from '../entities/ThesisGroup';

export class ThesisGroupController {
  private thesisGroupService: ThesisGroupService;

  constructor(dataSource: DataSource) {
    this.thesisGroupService = new ThesisGroupService(dataSource);
  }

  public getAllThesisGroups = (req: Request, res: Response) => RequestHandler.getAll<ThesisGroup>(req, res, this.thesisGroupService);
  public getThesisGroupById = (req: Request, res: Response) => RequestHandler.getById<ThesisGroup>(req, res, this.thesisGroupService);
  public updateThesisGroupMulti = (req: Request, res: Response) => RequestHandler.updateMulti<ThesisGroup>(req, res, this.thesisGroupService);
  public createThesisGroup = (req: Request, res: Response) => RequestHandler.create<ThesisGroup>(req, res, this.thesisGroupService);
  public updateThesisGroup = (req: Request, res: Response) => RequestHandler.update<ThesisGroup>(req, res, this.thesisGroupService);
  public deleteThesisGroup = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisGroupService);
  public getThesisGroupWhere = (req: Request, res: Response) => RequestHandler.getWhere<ThesisGroup>(req, res, this.thesisGroupService);
}
