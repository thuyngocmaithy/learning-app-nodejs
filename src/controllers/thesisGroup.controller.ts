import { Request, Response } from 'express';
import { ThesisGroupService } from '../services/thesisGroup.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { ThesisGroup } from '../entities/ThesisGroup';

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

  public async importThesisGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    try {
      const { data, createUserId } = req.body;
  
      // Kiểm tra dữ liệu
      if (!Array.isArray(data) || !createUserId) {
        return res.status(400).json({
          message: 'Dữ liệu không hợp lệ hoặc thiếu CreateUserId',
        });
      }
  
      // Validate dữ liệu từng hàng
      const isValidData = data.every(row =>
        Array.isArray(row) &&
        row.length >= 6 && // Chỉ cần tối thiểu 6 cột
        typeof row[0] === 'string' && // thesisGroupId
        typeof row[1] === 'string' && // thesisGroupName
        typeof row[2] === 'string' && // statusName
        !isNaN(Number(row[3])) && // startYear
        (row[4] === null || !isNaN(Number(row[4]))) && // finishYear
        typeof row[5] === 'string' // facultyName
      );
  
      if (!isValidData) {
        return res.status(400).json({
          message: 'Cấu trúc dữ liệu không hợp lệ',
        });
      }
  
      // Xử lý dữ liệu ngày mặc định nếu thiếu
      const processedData = data.map(row => {
        // Thêm giá trị ngày mặc định là null nếu không có
        if (row.length < 7) row.push(null); // startCreateThesisDate
        if (row.length < 8) row.push(null); // endCreateThesisDate
        return row;
      });
  
      // Gọi service để import dữ liệu
      await this.thesisGroupService.importThesisGroup(processedData, createUserId);
  
      return res.status(200).json({
        message: 'Import nhóm đề tài khóa luận thành công',
      });
    } catch (error: any) {
      console.error('[ThesisGroupController - importThesisGroup]:', error);
      return res.status(500).json({
        message: 'Có lỗi xảy ra khi import dữ liệu',
        error: error.message,
      });
    }
  }
  
  
}
