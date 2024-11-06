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


  public GetSubjectByMajor = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }

      const result = await this.studyFrameService.GetSubjectByMajor(userId);
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No study frame found for the major' });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error('Error in GetSubjectByMajor:', error);
      res.status(500).json({
        error: 'Error executing stored procedure GetSubjectByMajor',
      });
    }
  }


  public callKhungCTDT = async (req: Request, res: Response): Promise<void> => {
    try {
      // Lấy ngành và chu kỳ học của user để tìm studyFrame
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }

      const result = await this.studyFrameService.callKhungCTDT(userId);
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No data found for KhungCTDT' });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error('Error in callKhungCTDT:', error);
      res.status(500).json({
        error: 'Error executing stored procedure khungCTDT',
      });
    }
  }

  public callKhungCTDTDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      let result;
      // Lấy id chu kỳ
      const cycleId = req.query.cycleId;
      const facultyId = req.query.facultyId;

      if (!facultyId) {
        res.status(400).json({ message: 'facultyId is required' });
        return;
      }

      let startYear;

      // Nếu không có chu kỳ
      if (!cycleId) {
        // Lấy năm học đầu tiên và ngành
        startYear = req.query.startYear;
        if (!startYear) {
          res.status(400).json({ message: 'startYear or cycleId is required' });
          return;
        }
        // Tìm khung CTDT theo startyear và faculty
        result = await this.studyFrameService.callKhungCTDTDepartment(startYear as unknown as number, facultyId as string, null);
      }
      // Tìm khung CTDT theo cycleId và faculty
      else {
        result = await this.studyFrameService.callKhungCTDTDepartment(null, facultyId as string, cycleId as string);
      }

      if (!result || result.length === 0) {
        res.json([]); // Trả về mảng rỗng nếu không có dữ liệu
        return;
      }
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

}
