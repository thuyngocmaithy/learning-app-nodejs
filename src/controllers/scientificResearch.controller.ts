// scientificResearch.controller.ts
import { Request, Response } from 'express';
import { ScientificResearchService } from '../services/scientificResearch.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearch } from '../entities/ScientificResearch';
import { StatusCodes } from 'http-status-codes';

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
			const facultyId = req.query.faculty as string;

			const data = await this.scientificResearchService.getBySRGIdAndCheckApprove(SRGId, userId, facultyId);

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

	public importScienceResearch = async (req: Request, res: Response) => {
		try {
			const { data, createUserId } = req.body;

			if (!Array.isArray(data) || data.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
			}
			const response = await this.scientificResearchService.importScientificResearch(data, createUserId);
			res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
		} catch (error) {
			console.error('Error importing ScienceResearch:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing ScienceResearch', error: (error as Error).message });
		}
	}


	// Xử lý việc kiểm tra dữ liệu liên kết
	public async checkRelatedData(req: Request, res: Response): Promise<Response> {
		try {
			const ids = (req.query.ids as String).split(',');
			const result = await this.scientificResearchService.checkRelatedData(ids);
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
