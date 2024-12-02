// scientificResearch.controller.ts
import { Request, Response } from 'express';
import { ScientificResearchService } from '../services/scientificResearch.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearch } from '../entities/ScientificResearch';

export class ScientificResearchController {
	private scientificResearchService: ScientificResearchService;

	constructor(dataSource: DataSource) {
		this.scientificResearchService = new ScientificResearchService(dataSource);
		this.importScienceResearch = this.importScienceResearch.bind(this);
	}

	public getAllScientificResearchs = (req: Request, res: Response) => RequestHandler.getAll<ScientificResearch>(req, res, this.scientificResearchService);
	public getScientificResearchById = (req: Request, res: Response) => RequestHandler.getById<ScientificResearch>(req, res, this.scientificResearchService);
	public getScientificResearchWhere = (req: Request, res: Response) => RequestHandler.getWhere<ScientificResearch>(req, res, this.scientificResearchService);
	public createScientificResearch = (req: Request, res: Response) => RequestHandler.create<ScientificResearch>(req, res, this.scientificResearchService);
	public updateScientificResearch = (req: Request, res: Response) => RequestHandler.update<ScientificResearch>(req, res, this.scientificResearchService);
	public updateScientificResearchMulti = (req: Request, res: Response) => RequestHandler.updateMulti<ScientificResearch>(req, res, this.scientificResearchService);
	public deleteScientificResearch = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchService);

	public getByScientificResearchIGroupId = async (req: Request, res: Response) => {
		try {
			const scientificResearchGroupId = req.query.SRGId as string;

			const data = await this.scientificResearchService.getByScientificResearchGroupId(scientificResearchGroupId);

			return res.status(200).json({ message: 'success', data: data });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	public getBySRGIdAndCheckApprove = async (req: Request, res: Response) => {
		try {
			const SRGId = req.query.SRGId as string;
			const userId = req.query.userId as string;

			const data = await this.scientificResearchService.getBySRGIdAndCheckApprove(SRGId, userId);

			return res.status(200).json({ message: 'success', data: data });
		} catch (error) {
			const err = error as Error;
			console.error(err);
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	public getListSRJoined = async (req: Request, res: Response) => {
		try {
			const condition = req.query as Partial<ScientificResearch>;

			const result = await this.scientificResearchService.getListSRJoined(condition);
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

	public async importScienceResearch(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
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
				const startDate = parseDate(row[9]);
				const finishDate = parseDate(row[10]);

				return (
					Array.isArray(row) &&
					row.length >= 9 &&
					typeof row[0] === 'string' &&
					typeof row[1] === 'string' &&
					typeof row[2] === 'string' &&
					typeof row[3] === 'string' &&
					!isNaN(Number(row[4])) &&
					typeof row[5] === 'string' &&
					typeof row[6] === 'string' &&
					typeof row[7] === 'string' &&
					!isNaN(Number(row[8])) &&
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
				const startDate = parseDate(row[9]);
				const finishDate = parseDate(row[10]);
				return [
					row[0],
					row[1],
					row[2],
					row[3],
					row[4],
					row[5],
					row[6],
					row[7],
					row[8],
					startDate ? startDate.toISOString() : null,
					finishDate ? finishDate.toISOString() : null
				];
			});

			// Gọi service
			await this.scientificResearchService.importScientificResearch(processedData, createUserId);

			return res.status(200).json({
				message: 'Import đề tài thành công',
			});

		} catch (error: any) {
			console.error('[ScienceResearchController - importScienceResearch]:', error);
			return res.status(500).json({
				message: 'Có lỗi xảy ra khi import dữ liệu',
				error: error.message,
			});
		}
	}

}
