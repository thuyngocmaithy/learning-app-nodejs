// specialization.controller.ts
import { Request, Response } from 'express';
import { SpecializationService } from '../services/specialization.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Specialization } from '../entities/Specialization';
import { StatusCodes } from 'http-status-codes';

export class SpecializationController {
    private specializationService: SpecializationService;

    constructor(dataSource: DataSource) {
        this.specializationService = new SpecializationService(dataSource);
        this.importSpecialization = this.importSpecialization.bind(this);
    }

    public getAllSpecializations = (req: Request, res: Response) => RequestHandler.getAll<Specialization>(req, res, this.specializationService);
    public getSpecializationById = (req: Request, res: Response) => RequestHandler.getById<Specialization>(req, res, this.specializationService);
    public createSpecialization = (req: Request, res: Response) => RequestHandler.create<Specialization>(req, res, this.specializationService);
    public updateSpecialization = (req: Request, res: Response) => RequestHandler.update<Specialization>(req, res, this.specializationService);
    public deleteSpecialization = (req: Request, res: Response) => RequestHandler.delete(req, res, this.specializationService);
    public getSpecializationWhere = (req: Request, res: Response) => RequestHandler.getWhere<Specialization>(req, res, this.specializationService);

    public async importSpecialization(req: Request, res: Response) {
        try {
            const data = req.body;
            if (!Array.isArray(data) || data.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có dữ liệu' });
            }
            const response = await this.specializationService.importSpecialization(data);
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
            const result = await this.specializationService.checkRelatedData(ids);
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