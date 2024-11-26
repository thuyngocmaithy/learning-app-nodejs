import { Request, Response } from 'express';
import { Subject_Course_OpeningService } from '../services/subject_course_opening.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject_Course_Opening } from '../entities/Subject_Course_Opening';

export class Subject_Course_OpeningController {
  private service: Subject_Course_OpeningService;

  constructor(dataSource: DataSource) {
    this.service = new Subject_Course_OpeningService(dataSource);
  }

  public getAllSubjectCourseOpenings = (req: Request, res: Response) => RequestHandler.getAll<Subject_Course_Opening>(req, res, this.service);
  public getSubjectCourseOpeningWhere = (req: Request, res: Response) => RequestHandler.getWhere<Subject_Course_Opening>(req, res, this.service);
  public getSubjectCourseOpeningById = (req: Request, res: Response) => RequestHandler.getById<Subject_Course_Opening>(req, res, this.service);
  public createSubjectCourseOpening = (req: Request, res: Response) => RequestHandler.create<Subject_Course_Opening>(req, res, this.service);
  public updateSubjectCourseOpening = (req: Request, res: Response) => RequestHandler.update<Subject_Course_Opening>(req, res, this.service);

  public deleteSubjectCourseOpening = async (req: Request, res: Response) => {
    const { cycleId, studyFrameId } = req.query;

    try {
      if (!cycleId || !studyFrameId) {
        return res.status(400).json({ message: 'Year and StudyFrameId are required' });
      }

      // Gọi service để xóa các item theo cycleId và studyFrameId
      const result = await this.service.deleteSubjectCourseOpening(cycleId as unknown as string, studyFrameId as unknown as string);

      if (!result) {
        return res.status(404).json({ message: 'No records found to delete' });
      }

      return res.status(200).json({ message: 'Items deleted successfully' });
    } catch (error) {
      console.error('Error in deleteSubjectCourseOpening controller:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  // lưu nhiều Subject_Course_Opening cùng lúc
  public saveMulti = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body; // Lấy dữ liệu từ request body

      // Kiểm tra dữ liệu có phải là một mảng và không rỗng
      if (!Array.isArray(data) || data.length === 0) {
        res.status(400).json({ message: 'Data should be an array and cannot be empty.' });
        return;
      }

      // Gọi service để xử lý tạo nhiều Subject_Course_Opening
      const createdSubjectCourseOpenings = await this.service.saveMulti(data);

      // Trả về kết quả thành công
      res.status(201).json(createdSubjectCourseOpenings);
    } catch (error) {
      console.error('Error in createMulti:', error);
      res.status(500).json({ message: 'Unable to create multiple Subject_Course_Opening entries.' });
    }
  };

  // API để lấy danh sách giảng viên và học kỳ
  public getTeacherAssignmentsAndSemesters = async (req: Request, res: Response) => {
    try {
      const { teacherAssignments, selectedSemesters } = await this.service.getTeacherAssignmentsAndSemesters();
      res.status(200).json({
        teacherAssignments: Array.from(teacherAssignments.entries()),
        selectedSemesters: Array.from(selectedSemesters),
      });
    } catch (error) {
      console.error('Error getting data:', error);
      res.status(500).json({ message: 'Error fetching data' });
    }
  };
}