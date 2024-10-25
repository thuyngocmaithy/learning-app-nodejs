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
  }

  public getAllSubjects = (req: Request, res: Response) => RequestHandler.getAll<Subject>(req, res, this.subjectService);
  public getSubjectById = (req: Request, res: Response) => RequestHandler.getById<Subject>(req, res, this.subjectService);
  public createSubject = (req: Request, res: Response) => RequestHandler.create<Subject>(req, res, this.subjectService);
  public updateSubject = (req: Request, res: Response) => RequestHandler.update<Subject>(req, res, this.subjectService);
  public deleteSubject = (req: Request, res: Response) => RequestHandler.delete(req, res, this.subjectService);

  public callKhungCTDT = async (req: Request, res: Response): Promise<void> => {
    try {
      // Lấy ngành và chu kỳ học của user để tìm studyFrame
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }

      const result = await this.subjectService.callKhungCTDT(userId);
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
}

