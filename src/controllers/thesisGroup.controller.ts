import { Request, Response } from 'express';
import { ThesisGroupService } from '../services/thesisGroup.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ThesisGroup } from '../entities/ThesisGroup';
import { StatusCodes } from 'http-status-codes';

export class ThesisGroupController {
	private thesisGroupService: ThesisGroupService;

	constructor(dataSource: DataSource) {
		this.thesisGroupService = new ThesisGroupService(dataSource);
		this.importThesisGroup = this.importThesisGroup.bind(this);

	}

	public getAllThesisGroups = (req: Request, res: Response) => RequestHandler.getAll<ThesisGroup>(req, res, this.thesisGroupService);
	public getThesisGroupById = (req: Request, res: Response) => RequestHandler.getById<ThesisGroup>(req, res, this.thesisGroupService);
	public updateThesisGroupMulti = (req: Request, res: Response) => RequestHandler.updateMulti<ThesisGroup>(req, res, this.thesisGroupService);
	public createThesisGroup = (req: Request, res: Response) => RequestHandler.create<ThesisGroup>(req, res, this.thesisGroupService);
	public updateThesisGroup = (req: Request, res: Response) => RequestHandler.update<ThesisGroup>(req, res, this.thesisGroupService);
	public deleteThesisGroup = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisGroupService);
	public getThesisGroupWhere = (req: Request, res: Response) => RequestHandler.getWhere<ThesisGroup>(req, res, this.thesisGroupService);


	public checkValidDateCreateThesis = async (req: Request, res: Response) => {
		try {
			const { thesisGroupId } = req.query;

			const result = await this.thesisGroupService.checkValidDateCreateThesis(String(thesisGroupId));
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

	public importThesisGroup = async (req: Request, res: Response) => {
		try {
			const { thesisGroups, createUserId } = req.body; // Lấy danh sách thesisGroup

			if (!Array.isArray(thesisGroups) || thesisGroups.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
			}
			const response = await this.thesisGroupService.importThesisGroup(thesisGroups, createUserId);
			res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
		} catch (error) {
			console.error('Error importing thesisGroups:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing thesisGroups', error: (error as Error).message });
		}
	}


}
