import { Request, Response } from 'express';
import { ThesisService } from '../services/thesis.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Thesis } from '../entities/Thesis';
import { StatusCodes } from 'http-status-codes';

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

	public importThesis = async (req: Request, res: Response) => {
		try {
			const { data, createUserId } = req.body;

			if (!Array.isArray(data) || data.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
			}
			const response = await this.thesisService.importThesis(data, createUserId);
			res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
		} catch (error) {
			console.error('Error importing thesis:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing ScienceResearch', error: (error as Error).message });
		}
	}

	// Xử lý việc kiểm tra dữ liệu liên kết
	public async checkRelatedData(req: Request, res: Response): Promise<Response> {
		try {
			const ids = (req.query.ids as String).split(',');
			const result = await this.thesisService.checkRelatedData(ids);
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
