import { Request, Response } from 'express';
import { UserRegisterSubjectService } from '../services/user_register_subject.service';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';

export class UserRegisterSubjectController {
  private userRegisterSubjectService: UserRegisterSubjectService;

  constructor(dataSource: DataSource) {
    this.userRegisterSubjectService = new UserRegisterSubjectService(dataSource);
  }

  // Lưu môn học vào bảng user_register_subject
  public registerSubject = async (req: Request, res: Response) => {
    const { userId, subjectId, frameId, semesterId } = req.body; // Nhận thông tin từ request
    try {
      const result = await this.userRegisterSubjectService.registerSubject(userId, subjectId, frameId, semesterId);
      res.status(StatusCodes.CREATED).json({ message: 'Subject registered successfully', data: result });
    } catch (error) {
      console.error('Error registering subject:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to register subject', error: (error as Error).message });
    }
  };

  // Lấy danh sách môn học mà user đã đăng ký
  public getUserRegisteredSubjects = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      const subjects = await this.userRegisterSubjectService.getUserRegisteredSubjects(userId);
      res.status(StatusCodes.OK).json({ message: 'success', data: subjects });
    } catch (error) {
      console.error('Error fetching registered subjects:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch registered subjects', error: (error as Error).message });
    }
  };
}
