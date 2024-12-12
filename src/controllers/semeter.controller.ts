// semester.controller.ts
import { Request, Response } from 'express';
import { SemesterService } from '../services/semeter.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Semester } from '../entities/Semester';

export class SemesterController {
	private semesterService: SemesterService;

	constructor(dataSource: DataSource) {
		this.semesterService = new SemesterService(dataSource);
	}

	public getAllSemesters = (req: Request, res: Response) => RequestHandler.getAll<Semester>(req, res, this.semesterService);
	public getSemesterWhere = (req: Request, res: Response) => RequestHandler.getWhere<Semester>(req, res, this.semesterService);
	public getSemesterById = (req: Request, res: Response) => RequestHandler.getById<Semester>(req, res, this.semesterService);
	public createSemester = (req: Request, res: Response) => RequestHandler.create<Semester>(req, res, this.semesterService);
	public updateSemester = (req: Request, res: Response) => RequestHandler.update<Semester>(req, res, this.semesterService);
	public deleteSemester = (req: Request, res: Response) => RequestHandler.delete(req, res, this.semesterService);

	// Xử lý việc kiểm tra dữ liệu liên kết
	public async checkRelatedData(req: Request, res: Response): Promise<Response> {
		try {
			const ids = (req.query.ids as String).split(',');
			const result = await this.semesterService.checkRelatedData(ids);
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