import { Request, Response } from 'express';
import { ScientificResearchGroupService } from '../services/scientificResearchGroup.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { StatusCodes } from 'http-status-codes';

export class ScientificResearchGroupController {
	private scientificResearchGroupService: ScientificResearchGroupService;

	constructor(dataSource: DataSource) {
		this.scientificResearchGroupService = new ScientificResearchGroupService(dataSource);
	}

	public getAllScientificResearchGroups = (req: Request, res: Response) => RequestHandler.getAll<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
	public getScientificResearchGroupById = (req: Request, res: Response) => RequestHandler.getById<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
	public updateScientificResearchGroupMulti = (req: Request, res: Response) => RequestHandler.updateMulti<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
	public createScientificResearchGroup = (req: Request, res: Response) => RequestHandler.create<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
	public updateScientificResearchGroup = (req: Request, res: Response) => RequestHandler.update<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
	public deleteScientificResearchGroup = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchGroupService);
	public getSRGWhere = (req: Request, res: Response) => RequestHandler.getWhere<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);

	public checkValidDateCreateSR = async (req: Request, res: Response) => {
		try {
			const { scientificResearchGroupId } = req.query;

			const result = await this.scientificResearchGroupService.checkValidDateCreateSR(String(scientificResearchGroupId));
			if (result) {
				return res.status(200).json({ message: 'success', data: true });
			}
			return res.status(200).json({ message: 'success', data: false });

		} catch (error) {
			const err = error as Error;
			console.error(err);
			return res.status(500).json({ message: 'error', error: err.message });
		}
	}


	public importScientificReasearchGroup = async (req: Request, res: Response) => {
		try {
			const { SRGs, createUserId } = req.body; // Lấy danh sách SRG

			if (!Array.isArray(SRGs) || SRGs.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
			}
			const response = await this.scientificResearchGroupService.importScientificReasearchGroup(SRGs, createUserId);
			res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
		} catch (error) {
			console.error('Error importing SRGs:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing SRGs', error: (error as Error).message });
		}
	};
}
