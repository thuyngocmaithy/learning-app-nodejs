// src/controllers/subject.controller.ts
import { Request, Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject } from '../entities/Subject';

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
}
