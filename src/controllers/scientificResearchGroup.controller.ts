import { Request, Response } from 'express';
import { ScientificResearchGroupService } from '../services/scientificResearchGroup.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';

export class ScientificResearchGroupController {
  private scientificResearchGroupService: ScientificResearchGroupService;

  constructor(dataSource: DataSource) {
    this.scientificResearchGroupService = new ScientificResearchGroupService(dataSource);
    this.importScientificResearchGroup = this.importScientificResearchGroup.bind(this);
  }

  public getAllScientificResearchGroups = (req: Request, res: Response) => RequestHandler.getAll<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public getScientificResearchGroupById = (req: Request, res: Response) => RequestHandler.getById<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public updateScientificResearchGroupMulti = (req: Request, res: Response) => RequestHandler.updateMulti<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public createScientificResearchGroup = (req: Request, res: Response) => RequestHandler.create<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public updateScientificResearchGroup = (req: Request, res: Response) => RequestHandler.update<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);
  public deleteScientificResearchGroup = (req: Request, res: Response) => RequestHandler.delete(req, res, this.scientificResearchGroupService);
  public getSRGWhere = (req: Request, res: Response) => RequestHandler.getWhere<ScientificResearchGroup>(req, res, this.scientificResearchGroupService);

  public async importScientificResearchGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
      const { data, createUserId } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!Array.isArray(data) || !createUserId) {
        return res.status(400).json({
          message: 'Dữ liệu không hợp lệ hoặc thiếu CreateUserId',
        });
      }

      // Hàm parse ngày
      const parseDate = (dateString: string): Date | null => {
        const [day, month, year] = dateString.split('-').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
      };

      const isValidData = data.every(row => {
        const startCreateSRDate = parseDate(row[6]);
        const endCreateSRDate = parseDate(row[7]);

        return (
          Array.isArray(row) &&
          row.length >= 8 &&
          typeof row[0] === 'string' &&
          typeof row[1] === 'string' &&
          typeof row[2] === 'string' &&
          typeof row[3] === 'string' &&
          !isNaN(Number(row[4])) &&
          !isNaN(Number(row[5])) &&
          startCreateSRDate instanceof Date && !isNaN(startCreateSRDate.getTime()) &&
          endCreateSRDate instanceof Date && !isNaN(endCreateSRDate.getTime()) &&
          typeof row[8] === 'boolean'
        );
      });


      if (!isValidData) {
        return res.status(400).json({
          message: 'Cấu trúc dữ liệu không hợp lệ',
        });
      }


      const processedData = data.map(row => {
        const startCreateSRDate = parseDate(row[6]);
        const endCreateSRDate = parseDate(row[7]);

        return [
          row[0],
          row[1],
          row[2],
          row[3],
          row[4],
          row[5],
          startCreateSRDate ? startCreateSRDate.toISOString() : null,
          endCreateSRDate ? endCreateSRDate.toISOString() : null,
          row[8]
        ];
      })

      // gọi service
      await this.scientificResearchGroupService.importScientificReasearchGroup(processedData, createUserId);
      
      return res.status(200).json({
        message: 'Import đề tài thành công',
      });
    } catch (error: any) {
      console.error('[ScienceResearchGroupController - importScientificResearchGroup]:', error);
      return res.status(500).json({
        message: 'Có lỗi xảy ra khi import dữ liệu',
        error: error.message,
      });
    }
  }
}
