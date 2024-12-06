// src/controllers/subject.controller.ts
import { Request, Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { DataSource, Repository } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { StatusCodes } from 'http-status-codes';

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

	public importSubject = async (req: Request, res: Response) => {
		try {
			const { subjects, createUserId } = req.body; // Lấy danh sách môn học

			if (!Array.isArray(subjects) || subjects.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
			}
			const response = await this.subjectService.importSubject(subjects, createUserId);
			res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
		} catch (error) {
			console.error('Error importing subjects:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing subjects', error: (error as Error).message });
		}
	};

}

