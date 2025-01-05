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
	public updateSubjectCourseOpening = (req: Request, res: Response) => RequestHandler.update<Subject_Course_Opening>(req, res, this.service);


	public saveMultiSubjectCourseOpenings = async (req: Request, res: Response) => {
		try {
			// Lấy dữ liệu từ body của request
			const data = req.body;

			// Kiểm tra dữ liệu đầu vào
			if (!data || !Array.isArray(data)) {
				return res.status(400).json({ message: 'Data must be a non-empty array' });
			}

			// Gọi service để lưu dữ liệu
			const savedRecords = await this.service.saveMulti(data);

			// Trả về dữ liệu đã lưu
			return res.status(200).json({
				message: 'Records saved successfully',
				data: savedRecords,
			});
		} catch (error) {
			console.error('Error in saveMultiSubjectCourseOpenings controller:', error);
			return res.status(500).json({ message: 'Server error', error: error });
		}
	};

	// Hàm xóa dữ liệu theo semesterId và majorId
	public deleteSubjectCourseOpening = async (req: Request, res: Response) => {
		try {
			const { semesterId, majorId } = req.params;

			// Kiểm tra nếu thiếu semesterId hoặc majorId
			if (!semesterId || !majorId) {
				return res.status(400).json({ message: 'Both semesterId and majorId are required' });
			}

			// Gọi service để xóa dữ liệu
			await this.service.deleteBySemesterAndMajor(semesterId, majorId);

			// Trả về phản hồi thành công
			return res.status(200).json({
				message: `Deleted all course openings for semesterId: ${semesterId} and majorId: ${majorId}`,
			});
		} catch (error) {
			console.error('Error in deleteSubjectCourseOpening controller:', error);
			return res.status(500).json({ message: 'Server error', error: error });
		}
	};

	public getGroupedBySubjectForSemesters = async (req: Request, res: Response) => {
		try {
			// Lấy danh sách semesterIds từ query hoặc body
			const { major, semesterIds } = req.body;

			// Kiểm tra nếu không có semesterIds
			if (!semesterIds || !Array.isArray(semesterIds) || semesterIds.length === 0) {
				return res.status(400).json({ message: 'semesterIds must be a non-empty array' });
			}

			// Gọi service để lấy dữ liệu
			const groupedData = await this.service.getGroupedBySubjectForSemesters(major, semesterIds);

			// Trả về dữ liệu
			return res.status(200).json({
				message: 'Grouped data retrieved successfully',
				data: groupedData,
			});
		} catch (error) {
			console.error('Error in getGroupedBySubjectForSemesters controller:', error);
			return res.status(500).json({ message: 'Server error', error: error });
		}
	};

}