// feature.controller.ts
import { Request, Response } from 'express';
import { FeatureService } from '../services/feature.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Feature } from '../entities/Feature';

export class FeatureController {
	private featureService: FeatureService;

	constructor(dataSource: DataSource) {
		this.featureService = new FeatureService(dataSource);
	}

	public getAllFeatures = (req: Request, res: Response) => RequestHandler.getAll<Feature>(req, res, this.featureService);
	public getFeatureById = (req: Request, res: Response) => RequestHandler.getById<Feature>(req, res, this.featureService);
	public getFeatureWhereParentAndKeyRoute = (req: Request, res: Response) => RequestHandler.getWhere<Feature>(req, res, this.featureService);
	public createFeature = (req: Request, res: Response) => RequestHandler.create<Feature>(req, res, this.featureService);
	public updateFeature = (req: Request, res: Response) => RequestHandler.update<Feature>(req, res, this.featureService);
	public deleteFeature = (req: Request, res: Response) => RequestHandler.delete(req, res, this.featureService);
	public saveTreeDataController = (req: Request, res: Response) => {
		const treeData = req.body;
		try {
			const result = this.featureService.saveTreeData(treeData);
			res.status(200).json(result);
		} catch (error) {
			res.status(500).json({ message: 'Failed to save data' });
		}
	};

	// Xử lý việc kiểm tra dữ liệu liên kết
	public async checkRelatedData(req: Request, res: Response): Promise<Response> {
		try {
			const ids = (req.query.ids as String).split(',');
			const result = await this.featureService.checkRelatedData(ids);
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