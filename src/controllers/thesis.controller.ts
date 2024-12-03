import { Request, Response } from 'express';
import { ThesisService } from '../services/thesis.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Thesis } from '../entities/Thesis';

export class ThesisController {
	private thesisService: ThesisService;

	constructor(dataSource: DataSource) {
		this.thesisService = new ThesisService(dataSource);
		this.importThesis = this.importThesis.bind(this);
	}

	public getAllThesis = (req: Request, res: Response) => RequestHandler.getAll<Thesis>(req, res, this.thesisService);
	public getThesisById = (req: Request, res: Response) => RequestHandler.getById<Thesis>(req, res, this.thesisService);
	public getPermissionFeatureWhere = (req: Request, res: Response) => RequestHandler.getWhere<Thesis>(req, res, this.thesisService);
	public createThesis = (req: Request, res: Response) => RequestHandler.create<Thesis>(req, res, this.thesisService);
	public updateThesis = (req: Request, res: Response) => RequestHandler.update<Thesis>(req, res, this.thesisService);
	public updateThesisMulti = (req: Request, res: Response) => RequestHandler.updateMulti<Thesis>(req, res, this.thesisService);
	public deleteThesis = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisService);

	public getByThesisIGroupId = async (req: Request, res: Response) => {
		try {
			const thesisGroupId = req.query.thesisGroupId as string;

			const data = await this.thesisService.getByThesisGroupId(thesisGroupId);

			return res.status(200).json({ message: 'success', data: data });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	public getByThesisGroupIdAndCheckApprove = async (req: Request, res: Response) => {
		try {
			const thesisGroupId = req.query.thesisGroupId as string;
			const userId = req.query.userId as string;

			const data = await this.thesisService.getByThesisGroupIdAndCheckApprove(thesisGroupId, userId);

			return res.status(200).json({ message: 'success', data: data });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	public getListThesisJoined = async (req: Request, res: Response) => {
		try {
			const condition = req.query as Partial<Thesis>;

			const result = await this.thesisService.getListThesisJoined(condition);
			if (result !== null && result.length > 0) {
				return res.status(200).json({ message: 'success', data: result });
			}
			return res.status(204).json({ message: 'success', data: [] });

		} catch (error) {
			const err = error as Error;
			console.error(err);
			return res.status(500).json({ message: 'error', error: err.message });
		}
	}


	public async importThesis(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
		try {
			const { data, createUserId } = req.body;

			// Kiểm tra dữ liệu đầu vào
			if (!Array.isArray(data) || !createUserId) {
				return res.status(400).json({
					message: 'Dữ liệu không hợp lệ hoặc thiếu CreateUserId',
				});
			}

			// Hàm parse ngày
			const parseDate = (dateString: string): Date | null => {
				const [day, month, year] = dateString.split('-').map(Number);
				if (!day || !month || !year) return null;
				return new Date(year, month - 1, day);
			};

			// Validate dữ liệu
			const isValidData = data.every(row => {
				const startDate = parseDate(row[7]);
				const finishDate = parseDate(row[8]);
				return (
					Array.isArray(row) &&
					row.length >= 8 &&
					typeof row[0] === 'string' &&
					typeof row[1] === 'string' &&
					typeof row[2] === 'string' &&
					typeof row[3] === 'string' &&
					!isNaN(Number(row[4])) &&
					typeof row[5] === 'string' &&
					typeof row[6] === 'string' &&
					startDate instanceof Date && !isNaN(startDate.getTime()) &&
					finishDate instanceof Date && !isNaN(finishDate.getTime())
				);
			});

			if (!isValidData) {
				return res.status(400).json({
					message: 'Cấu trúc dữ liệu không hợp lệ',
				});
			}

			// Chuẩn hóa dữ liệu
			const processedData = data.map(row => {
				const startDate = parseDate(row[7]);
				const finishDate = parseDate(row[8]);
				return [
					row[0],
					row[1],
					row[2],
					row[3],
					row[4],
					row[5],
					row[6],
					startDate ? startDate.toISOString() : null,
					finishDate ? finishDate.toISOString() : null
				];
			});

			// Gọi service
			await this.thesisService.importThesis(processedData, createUserId);

			return res.status(200).json({
				message: 'Import đề tài thành công',
			});
		} catch (error: any) {
			console.error('[ThesisController - importThesis]:', error);
			return res.status(500).json({
				message: 'Có lỗi xảy ra khi import dữ liệu',
				error: error.message,
			});
		}
	}


}
