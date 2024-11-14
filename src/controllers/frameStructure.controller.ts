// frameStructure.controller.ts
import { Request, Response } from 'express';
import { FrameStructureService } from '../services/frameStructure.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { FrameStructure } from '../entities/FrameStructure';
export class FrameStructureController {
  private frameStructureService: FrameStructureService;

  constructor(dataSource: DataSource) {
    this.frameStructureService = new FrameStructureService(dataSource);
  }

  public getAllFrameStructures = (req: Request, res: Response) => RequestHandler.getAll<FrameStructure>(req, res, this.frameStructureService);
  public getFrameStructureById = (req: Request, res: Response) => RequestHandler.getById<FrameStructure>(req, res, this.frameStructureService);
  public createFrameStructure = (req: Request, res: Response) => RequestHandler.create<FrameStructure>(req, res, this.frameStructureService);
  public updateFrameStructure = (req: Request, res: Response) => RequestHandler.update<FrameStructure>(req, res, this.frameStructureService);
  public deleteFrameStructure = (req: Request, res: Response) => RequestHandler.delete(req, res, this.frameStructureService);
  public getFrameStructureWhere = (req: Request, res: Response) => RequestHandler.getWhere<FrameStructure>(req, res, this.frameStructureService);
  public saveTreeDataController = (req: Request, res: Response) => {
    const treeData = req.body;
    try {
      const result = this.frameStructureService.saveTreeData(treeData);
      if (result) {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to save data' });
    }
  };

}
