import { Request, Response } from 'express';
import { StudyFrame_ComponentService } from '../services/studyFrame_component.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { StudyFrame_Component } from '../entities/StudyFrame';
export class StudyFrame_ComponentController {
  private studyFrameCompService: StudyFrame_ComponentService;

  constructor(dataSource: DataSource) {
    this.studyFrameCompService = new StudyFrame_ComponentService(dataSource);
  }

  public getAllStudyFrame_Components = (req: Request, res: Response) => RequestHandler.getAll<StudyFrame_Component>(req, res, this.studyFrameCompService);
  public getStudyFrame_ComponentWhere = (req: Request, res: Response) => RequestHandler.getWhere<StudyFrame_Component>(req, res, this.studyFrameCompService);
  public getStudyFrame_ComponentById = (req: Request, res: Response) => RequestHandler.getById<StudyFrame_Component>(req, res, this.studyFrameCompService);
  public createStudyFrame_Component = (req: Request, res: Response) => RequestHandler.create<StudyFrame_Component>(req, res, this.studyFrameCompService);
  public updateStudyFrame_Component = (req: Request, res: Response) => RequestHandler.update<StudyFrame_Component>(req, res, this.studyFrameCompService);
  public deleteStudyFrame_Component = (req: Request, res: Response) => RequestHandler.delete(req, res, this.studyFrameCompService);

  // Xử lý việc kiểm tra dữ liệu liên kết
  public async checkRelatedData(req: Request, res: Response): Promise<Response> {
    try {
      const ids = (req.query.ids as String).split(',');
      const result = await this.studyFrameCompService.checkRelatedData(ids);
      if (result?.success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({ success: false, message: result.message });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Lỗi khi kiểm tra dữ liệu liên kết: ${error}`,
      });
    }
  }
}
