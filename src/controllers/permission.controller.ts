import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Permission } from '../entities/Permission';

export class PermissionController {
	private permissionService: PermissionService;

	constructor(dataSource: DataSource) {
		this.permissionService = new PermissionService(dataSource);
	}

	public getAllPermissions = (req: Request, res: Response) => RequestHandler.getAll<Permission>(req, res, this.permissionService);
	public getPermissionByPermissionId = (req: Request, res: Response) => RequestHandler.getById<Permission>(req, res, this.permissionService);
	public createPermission = (req: Request, res: Response) => RequestHandler.create<Permission>(req, res, this.permissionService);
	public updatePermission = (req: Request, res: Response) => RequestHandler.update<Permission>(req, res, this.permissionService);
	public deletePermission = (req: Request, res: Response) => RequestHandler.delete(req, res, this.permissionService);

	// Xử lý việc kiểm tra dữ liệu liên kết
	public async checkRelatedData(req: Request, res: Response): Promise<Response> {
		try {
			const ids = (req.query.ids as String).split(',');
			const result = await this.permissionService.checkRelatedData(ids);
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