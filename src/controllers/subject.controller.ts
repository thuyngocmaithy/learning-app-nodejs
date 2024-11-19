// src/controllers/subject.controller.ts
import { Request, Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { DataSource, Repository } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export class SubjectController {
  private subjectService: SubjectService;

  constructor(dataSource: DataSource) {
    this.subjectService = new SubjectService(dataSource);
    this.importSubject = this.importSubject.bind(this);
  }

  public getAllSubjects = (req: Request, res: Response) => RequestHandler.getAll<Subject>(req, res, this.subjectService);
  public getSubjectById = (req: Request, res: Response) => RequestHandler.getById<Subject>(req, res, this.subjectService);
  public createSubject = (req: Request, res: Response) => RequestHandler.create<Subject>(req, res, this.subjectService);
  public updateSubject = (req: Request, res: Response) => RequestHandler.update<Subject>(req, res, this.subjectService);
  public deleteSubject = (req: Request, res: Response) => RequestHandler.delete(req, res, this.subjectService);

  public getSubjectByFacultyId = async (req: Request, res: Response) => {
    const { facultyId } = req.params; // Get facultyId from the request parameters
    try {
      const subjects = await this.subjectService.getSubjectByFacultyId(facultyId);
      res.status(200).json(subjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Unable to fetch subjects by faculty ID.' });
    }
  };

  public getAllSubjectDetail = async (req: Request, res: Response) => {
    try {
      const subjects = await this.subjectService.getAllSubjectDetail();
      res.status(200).json(subjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Unable to fetch subjects detail.' });
    }
  };

  public getSubjectWhere = (req: Request, res: Response) => RequestHandler.getWhere<Subject>(req, res, this.subjectService);

  public async importSubject(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
        const { data, createUserId } = req.body;

        // Kiểm tra dữ liệu
        if (!Array.isArray(data) || !createUserId) {
            return res.status(400).json({
                message: 'Dữ liệu không hợp lệ hoặc thiếu CreateUserId',
            });
        }
        console.log(data)
        // Validate dữ liệu từng hàng
        const isValidData = data.every(row =>
          Array.isArray(row) &&
          row.length >= 4 &&
          (typeof row[0] === 'string' || typeof row[0] === 'number') && // subjectId có thể là string hoặc number
          typeof row[1] === 'string' && // subjectName
          !isNaN(Number(row[2])) && // creditHour
          typeof row[3] === 'boolean' // isCompulsory
      );
      

        if (!isValidData) {
            return res.status(400).json({
                message: 'Cấu trúc dữ liệu không hợp lệ',
            });
        }

        // Gọi service để import dữ liệu
        await this.subjectService.importSubject(data, createUserId);

        return res.status(200).json({
            message: 'Import môn học thành công',
        });
    } catch (error: any) {
        console.error('[SubjectController - importSubject]:', error);
        return res.status(500).json({
            message: 'Có lỗi xảy ra khi import dữ liệu',
            error: error.message,
        });
    }
  }

}

