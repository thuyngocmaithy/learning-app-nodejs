// status.controller.ts
import { Request, Response } from 'express';
import { StatusService } from '../services/status.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Status } from '../entities/Status';

export class StatusController {
	private statusService: StatusService;

	constructor(dataSource: DataSource) {
		this.statusService = new StatusService(dataSource);
		this.importStatus = this.importStatus.bind(this);

	}

	public getAllStatuses = (req: Request, res: Response) => RequestHandler.getAll<Status>(req, res, this.statusService);
	public getStatusById = (req: Request, res: Response) => RequestHandler.getById<Status>(req, res, this.statusService);
	public getStatusByType = async (req: Request, res: Response) => {
		const type = req.query.type as 'Tiến độ đề tài NCKH' | 'Tiến độ đề tài khóa luận' | 'Tiến độ nhóm đề tài NCKH' | 'Tiến độ nhóm đề tài khóa luận';
		if (!type) {
			return res.status(400).json({ message: 'Thiếu tham số type' });
		}

		try {
			const statuses = await this.statusService.getByType(type);
			res.status(200).json(statuses);
		} catch (error: any) {
			res.status(500).json({ message: 'Lỗi khi lấy trạng thái theo loại', error: error.message });
		}
	};
	public createStatus = (req: Request, res: Response) => RequestHandler.create<Status>(req, res, this.statusService);
	public updateStatus = (req: Request, res: Response) => RequestHandler.update<Status>(req, res, this.statusService);
	public deleteStatus = (req: Request, res: Response) => RequestHandler.delete(req, res, this.statusService);
	public getStatusWhere = (req: Request, res: Response) => RequestHandler.getWhere<Status>(req, res, this.statusService);

	public async importStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
		try {
			const statuses = req.body.data;
			const createUserId = req.body.createUserId;

			if (!Array.isArray(statuses) || !createUserId) {
				return res.status(400).json({ message: 'Dữ liệu không hợp lệ hoặc thiếu CreateUserId' });
			}

			await this.statusService.importStatus(statuses, createUserId);

			return res.status(200).json({ message: 'Import trạng thái thành công' });
		} catch (error: any) {
			console.error('[StatusController - importStatus]:', error);
			return res.status(500).json({
				message: 'Có lỗi xảy ra khi import dữ liệu',
				error: error.message,
			});
		}
	}

	// Xử lý việc kiểm tra dữ liệu liên kết
	public async checkRelatedData(req: Request, res: Response): Promise<Response> {
		try {
			const ids = (req.query.ids as String).split(',');
			const result = await this.statusService.checkRelatedData(ids);
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