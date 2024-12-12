// faculty.controller.ts
import { Request, Response } from 'express';
import { FacultyService } from '../services/faculty.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Faculty } from '../entities/Faculty';
import * as ExcelJS from 'exceljs';
import { StatusCodes } from 'http-status-codes';

export class FacultyController {
	private facultyService: FacultyService;

	constructor(dataSource: DataSource) {
		this.facultyService = new FacultyService(dataSource);
	}

	public getAllFaculties = (req: Request, res: Response) => RequestHandler.getAll<Faculty>(req, res, this.facultyService);
	public getFacultyByFacultyId = (req: Request, res: Response) => {
		const facultyId = req.params.id;
		this.facultyService.getByFacultyId(facultyId)
			.then((faculty) => {
				if (faculty) {
					res.status(200).json({ success: true, data: faculty });
				} else {
					res.status(404).json({ success: false, message: 'Faculty not found' });
				}
			})
			.catch((err) => {
				console.error('Get Faculty By FacultyId Error:', err);
				res.status(500).json({ success: false, message: err.message });
			});
	}
	public getFacultyWhere = (req: Request, res: Response) => RequestHandler.getWhere<Faculty>(req, res, this.facultyService);
	public createFaculty = (req: Request, res: Response) => RequestHandler.create<Faculty>(req, res, this.facultyService);
	public updateFaculty = (req: Request, res: Response) => RequestHandler.update<Faculty>(req, res, this.facultyService);
	// public deleteFaculty = (req: Request, res: Response) => RequestHandler.delete(req, res, this.facultyService);

	public deleteFaculty = async (req: Request, res: Response) => {
		const ids = (req.query.ids as String).split(',');
		const response = await this.facultyService.delete(ids);

		if (response.success) {
			return res.status(200).json({ success: true, message: response.message });
		} else {
			return res.status(400).json({ success: false, message: response.message });
		}
	};


	public importFaculty = async (req: Request, res: Response) => {
		try {
			const data = req.body;

			if (!Array.isArray(data) || data.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
			}
			const response = await this.facultyService.importFaculty(data);
			res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
		} catch (error) {
			console.error('Error importing faculties:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing faculties', error: (error as Error).message });
		}
	}


}