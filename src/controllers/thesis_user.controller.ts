import { Request, Response } from 'express';
import { Thesis_UserService } from '../services/thesis_user.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Thesis_User } from '../entities/Thesis_User';
import { UserService } from '../services/User.service';
import { ThesisService } from '../services/thesis.service';
import { ThesisGroupService } from '../services/thesisGroup.service';

export class Thesis_UserController {
	private thesisUserService: Thesis_UserService;
	private userService: UserService;
	private thesisService: ThesisService;

	constructor(dataSource: DataSource) {
		this.thesisUserService = new Thesis_UserService(dataSource);
		this.userService = new UserService(dataSource);
		this.thesisService = new ThesisService(dataSource);
	}

	public getAllThesisUser = (req: Request, res: Response) => RequestHandler.getAll<Thesis_User>(req, res, this.thesisUserService);
	public getThesisUserById = (req: Request, res: Response) => RequestHandler.getById<Thesis_User>(req, res, this.thesisUserService);
	public deleteThesisUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.thesisUserService);
	public getThesisUserWhere = (req: Request, res: Response) => RequestHandler.getWhere<Thesis_User>(req, res, this.thesisUserService);

	public updateThesisUser = async (req: Request, res: Response) => {
		try {
			const ids = (req.params.id as String).split(',');
			const data = req.body;
			const result = await this.thesisUserService.update(ids, data);
			if (result) {
				return res.status(200).json({ message: 'success', data: result });
			}
			return res.status(404).json({ message: 'SRU not found' });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	}

	//lấy ThesisUser có group cao nhất
	public getHighestGroupThesisUser = (req: Request, res: Response) => {
		this.thesisUserService.getHighestGroupThesisUser()
			.then(thesisUser => res.status(200).json({ message: 'success', data: thesisUser }))
			.catch(error => res.status(500).json({ message: 'error', error: error.message }));
	};

	public getByThesisId = async (req: Request, res: Response) => {
		try {
			const thesisId = req.query.thesis as string | undefined;

			if (!thesisId) {
				return res.status(400).json({ message: 'Invalid thesis ID' });
			}

			const thesis = await this.thesisService.getById(thesisId);  // Fetch the User entity by ID

			if (!thesis) {
				return res.status(404).json({ message: 'Thesis not found' });
			}

			const thesisUser = await this.thesisUserService.getByThesis(thesis);

			return res.status(200).json({ message: 'success', data: thesisUser });
		} catch (error) {
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	};

	// Delete Thesis_User by user and thesis
	public deleteByUserAndThesis = async (req: Request, res: Response) => {
		try {
			const userId = req.query.user as string | undefined;
			const thesisId = req.query.thesis as string | undefined;

			if (!userId || !thesisId) {
				return res.status(400).json({ message: 'Invalid user ID or thesis ID' });
			}

			const user = await this.userService.getByUserId(userId);
			const thesis = await this.thesisService.getById(thesisId); // Fetch the Thesis entity by ID

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			if (!thesis) {
				return res.status(404).json({ message: 'Thesis not found' });
			}
			const deletionResult = await this.thesisUserService.deleteByUserAndThesis(user, thesis);

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

	public createThesisUser = async (req: Request, res: Response): Promise<Response> => {
		try {
			// Lấy dữ liệu từ body của yêu cầu
			const thesisUserData = req.body;

			// Gọi hàm create từ service
			await this.thesisUserService.create(thesisUserData);

			// Trả về phản hồi thành công
			return res.status(200).json({ message: 'success', data: 'Lưu thành công' });
		} catch (error) {
			console.error('Error creating Thesis User:', error);
			// Trả về phản hồi lỗi
			const err = error as Error;
			return res.status(500).json({ message: 'error', error: err.message });
		}
	}

	public getByListThesisId = async (req: Request, res: Response) => {
		try {
			const ids = (req.params.ids as String).split(',');
			const result = await this.thesisUserService.getByListThesisId(ids);
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