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
}
