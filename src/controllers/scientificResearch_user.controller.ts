import { Request, Response } from 'express';
import { ScientificResearch_UserService } from '../services/scientificResearch_user.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearch_User } from '../entities/ScientificResearch_User';
import { UserService } from '../services/User.service';
import { ScientificResearchService } from '../services/scientificResearch.service';
import { ScientificResearchGroupService } from '../services/scientificResearchGroup.service';

export class ScientificResearch_UserController {
	private scientificResearchUserService: ScientificResearch_UserService;
	private userService: UserService;
	private scientificResearchService: ScientificResearchService;
	private scientificResearchGroupService: ScientificResearchGroupService;

	constructor(dataSource: DataSource) {
		this.scientificResearchUserService = new ScientificResearch_UserService(dataSource);
		this.userService = new UserService(dataSource);
		this.scientificResearchService = new ScientificResearchService(dataSource);
		this.scientificResearchGroupService = new ScientificResearchGroupService(dataSource);
	}

	public getAllScientificResearchUser = (req: Request, res: Response) => RequestHandler.getAll<ScientificResearch_User>(req, res, this.scientificResearchUserService);
	public getScientificResearchUserById = (req: Request, res: Response) => RequestHandler.getById<ScientificResearch_User>(req, res, this.scientificResearchUserService);
	public deleteScientificResearchUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchUserService);
	public getScientificResearchUserWhere = (req: Request, res: Response) => RequestHandler.getWhere<ScientificResearch_User>(req, res, this.scientificResearchUserService);

	public updateScientificResearchUser = async (req: Request, res: Response) => {
		try {
			const ids = (req.params.id as String).split(',');
			const data = req.body;
			const result = await this.scientificResearchUserService.update(ids, data);
			if (result) {
				return res.status(200).json({ message: 'success', data: result });
			}
			return res.status(404).json({ message: 'SRU not found' });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	}

	//lấy ScientificResearchUser có group cao nhất
	public getHighestGroupScientificResearchUser = (req: Request, res: Response) => {
		this.scientificResearchUserService.getHighestGroupScientificResearchUser()
			.then(scientificResearchUser => res.status(200).json({ message: 'success', data: scientificResearchUser }))
			.catch(error => res.status(500).json({ message: 'error', error: error.message }));
	};

	public getByScientificResearchId = async (req: Request, res: Response) => {
		try {
			const scientificResearchId = req.query.scientificResearch as string | undefined;

			if (!scientificResearchId) {
				return res.status(400).json({ message: 'Invalid scientificResearch ID' });
			}

			const scientificResearch = await this.scientificResearchService.getById(scientificResearchId);  // Fetch the User entity by ID

			if (!scientificResearch) {
				return res.status(404).json({ message: 'ScientificResearch not found' });
			}

			const scientificResearchUser = await this.scientificResearchUserService.getByScientificResearch(scientificResearch);

			return res.status(200).json({ message: 'success', data: scientificResearchUser });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	// Delete ScientificResearch_User by user and scientificResearch
	public deleteByUserAndScientificResearch = async (req: Request, res: Response) => {
		try {
			const userId = req.query.user as string | undefined;
			const scientificResearchId = req.query.scientificResearch as string | undefined;

			if (!userId || !scientificResearchId) {
				return res.status(400).json({ message: 'Invalid user ID or scientificResearch ID' });
			}

			const user = await this.userService.getByUserId(userId);
			const scientificResearch = await this.scientificResearchService.getById(scientificResearchId); // Fetch the ScientificResearch entity by ID

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			if (!scientificResearch) {
				return res.status(404).json({ message: 'ScientificResearch not found' });
			}
			const deletionResult = await this.scientificResearchUserService.deleteByUserAndScientificResearch(user, scientificResearch);

			if (deletionResult) {
				return res.status(200).json({ message: 'success', data: 'Xóa thành công' });
			} else {
				return res.status(404).json({ message: 'Record not found' });
			}
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	public createScientificResearchUser = async (req: Request, res: Response): Promise<Response> => {
		try {
			// Lấy dữ liệu từ body của yêu cầu
			const scientificResearchUserData = req.body;

			// Gọi hàm create từ service
			await this.scientificResearchUserService.create(scientificResearchUserData);

			// Trả về phản hồi thành công
			return res.status(200).json({ message: 'success', data: 'Lưu thành công' });
		} catch (error) {
			console.error('Error creating Scientific Research User:', error);
			// Trả về phản hồi lỗi
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	}

	public getByListSRId = async (req: Request, res: Response) => {
		try {
			const ids = (req.params.ids as String).split(',');
			const result = await this.scientificResearchUserService.getByListSRId(ids);
			if (result) {
				return res.status(200).json({ message: 'success', data: result });
			}
			return res.status(204).json({ message: 'success', data: [] });
		} catch (error) {
			console.error("Update Error:", error);
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};
}