import { Request, Response } from 'express';
import { ThesisService } from '../services/thesis.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Thesis } from '../entities/Thesis';

export class ThesisController {
  private thesisService: ThesisService;

  constructor(dataSource: DataSource) {
    this.thesisService = new ThesisService(dataSource);
  }

  public getAllThesis = (req: Request, res: Response) => RequestHandler.getAll<Thesis>(req, res, this.thesisService);
  public getThesisById = (req: Request, res: Response) => RequestHandler.getById<Thesis>(req, res, this.thesisService);
  public getPermissionFeatureWhere = (req: Request, res: Response) => RequestHandler.getWhere<Thesis>(req, res, this.thesisService);
  public createThesis = (req: Request, res: Response) => RequestHandler.create<Thesis>(req, res, this.thesisService);
  public updateThesis = (req: Request, res: Response) => RequestHandler.update<Thesis>(req, res, this.thesisService);
  public updateThesisMulti = (req: Request, res: Response) => RequestHandler.updateMulti<Thesis>(req, res, this.thesisService);
  public deleteThesis = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisService);

  public getByThesisIGroupId = async (req: Request, res: Response) => {
    try {
      const thesisGroupId = req.query.thesisGroupId as string;

      const data = await this.thesisService.getByThesisGroupId(thesisGroupId);

      return res.status(200).json({ message: 'success', data: data });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };

  public getByThesisGroupIdAndCheckApprove = async (req: Request, res: Response) => {
    try {
      const thesisGroupId = req.query.thesisGroupId as string;
      const userId = req.query.userId as string;

      const data = await this.thesisService.getByThesisGroupIdAndCheckApprove(thesisGroupId, userId);

      return res.status(200).json({ message: 'success', data: data });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };
}
