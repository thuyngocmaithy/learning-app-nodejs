// major.controller.ts
import { Request, Response } from 'express';
import { MajorService } from '../services/major.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Major } from '../entities/Major';

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
            const majors = req.body;
    
            if (!Array.isArray(majors)) {
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
            }
    
            await this.majorService.importMajor(majors);
    
            res.status(200).json({ message: 'Import thành công' });
        } catch (error: any) {
            console.error('[MajorController - importMajor]:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi import dữ liệu',
                error: error.message,
            });
        }
    }
    
}