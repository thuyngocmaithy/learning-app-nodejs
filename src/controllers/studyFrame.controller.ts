// studyFrame.controller.ts
import { Request, Response } from 'express';
import { StudyFrameService } from '../services/studyFrame.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { StudyFrame } from '../entities/StudyFrame';
export class StudyFrameController {
  private studyFrameService: StudyFrameService;

  constructor(dataSource: DataSource) {
    this.studyFrameService = new StudyFrameService(dataSource);
  }

  public getAllStudyFrames = (req: Request, res: Response) => RequestHandler.getAll<StudyFrame>(req, res, this.studyFrameService);
  public getStudyFrameById = (req: Request, res: Response) => RequestHandler.getById<StudyFrame>(req, res, this.studyFrameService);
  public createStudyFrame = (req: Request, res: Response) => RequestHandler.create<StudyFrame>(req, res, this.studyFrameService);
  public updateStudyFrame = (req: Request, res: Response) => RequestHandler.update<StudyFrame>(req, res, this.studyFrameService);
  public deleteStudyFrame = (req: Request, res: Response) => RequestHandler.delete(req, res, this.studyFrameService);
  public getStudyFrameWhere = (req: Request, res: Response) => RequestHandler.getWhere<StudyFrame>(req, res, this.studyFrameService);

  public findKhungCTDTByUserId = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }
      // Tìm khung CTDT theo userid
      const result = await this.studyFrameService.findKhungCTDTByUserId(userId);

      return res.status(200).json({ message: 'success', data: result });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };


  public findKhungCTDTDepartment = async (req: Request, res: Response) => {
    try {
      let result;
      // Lấy id chu kỳ
      const cycleId = req.query.cycleId;
      const majorId = req.query.majorId;

      if (!majorId) {
        throw new Error('Not found entity major');
      }

      let startYear;

      // Nếu không có chu kỳ
      if (!cycleId) {
        // Lấy năm học đầu tiên và ngành
        startYear = req.query.startYear;
        if (!startYear) {
          throw new Error('Not found startYear');
        }
        // Tìm khung CTDT theo startyear và major
        result = await this.studyFrameService.findKhungCTDTDepartment(startYear as unknown as number, majorId as string, null);
      }
      // Tìm khung CTDT theo cycleId và major
      else {
        result = await this.studyFrameService.findKhungCTDTDepartment(null, majorId as string, cycleId as string);
      }

      return res.status(200).json({ message: 'success', data: result });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'error', error: err.message });
    }
  };


  public callKhungCTDT = async (req: Request, res: Response): Promise<void> => {
    try {
      const studyFrameId = req.query.studyFrame as string;

      if (!studyFrameId) {
        res.status(400).json({ message: 'studyFrameId is required' });
        return;
      }

      // Gọi service và lấy kết quả
      const result = await this.studyFrameService.callKhungCTDT(studyFrameId);

      if (!result || result.length === 0) {
        // Nếu không có dữ liệu, trả về mảng rỗng
        res.json([]);
        return;
      }

      // Trả về kết quả cho client
      res.json(result);

    } catch (error) {
      console.error('Error in callKhungCTDT:', error);
      res.status(500).json({
        error: 'Error executing stored procedure khungCTDT',
      });
    }
  }



  public getAllStudyFrameComponents = async (req: Request, res: Response): Promise<void> => {
    try {
      const components = await this.studyFrameService.getAllComponents();
      res.json(components);
    } catch (error) {
      console.error('Error in getAllStudyFrameComponents:', error);
      res.status(500).json({ error: 'Error fetching study frame components' });
    }
  }

  // Xử lý việc kiểm tra dữ liệu liên kết
  public async checkRelatedData(req: Request, res: Response): Promise<Response> {
    try {
      const ids = (req.query.ids as String).split(',');
      const result = await this.studyFrameService.checkRelatedData(ids);
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
