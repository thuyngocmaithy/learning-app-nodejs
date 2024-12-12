// major.controller.ts
import { Request, Response } from 'express';
import { MajorService } from '../services/major.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Major } from '../entities/Major';
import { StatusCodes } from 'http-status-codes';

export class MajorController {
    private majorService: MajorService;

    constructor(dataSource: DataSource) {
        this.majorService = new MajorService(dataSource);
        this.importMajor = this.importMajor.bind(this);
    }

    public getAllMajors = (req: Request, res: Response) => RequestHandler.getAll<Major>(req, res, this.majorService);
    public getMajorById = (req: Request, res: Response) => RequestHandler.getById<Major>(req, res, this.majorService);
    public createMajor = (req: Request, res: Response) => RequestHandler.create<Major>(req, res, this.majorService);
    public updateMajor = (req: Request, res: Response) => RequestHandler.update<Major>(req, res, this.majorService);
    public deleteMajor = (req: Request, res: Response) => RequestHandler.delete(req, res, this.majorService);
    public getMajorWhere = (req: Request, res: Response) => RequestHandler.getWhere<Major>(req, res, this.majorService);

    public async importMajor(req: Request, res: Response) {
        try {
            const data = req.body;
            if (!Array.isArray(data) || data.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
            }
            const response = await this.majorService.importMajor(data);
            res.status(StatusCodes.CREATED).json({ message: 'success', data: response });
        } catch (error) {
            console.error('Error importing faculties:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing faculties', error: (error as Error).message });
        }
    }

    // Xử lý việc kiểm tra dữ liệu liên kết
    public async checkRelatedData(req: Request, res: Response): Promise<Response> {
        try {
            const ids = (req.query.ids as String).split(',');
            const result = await this.majorService.checkRelatedData(ids);
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