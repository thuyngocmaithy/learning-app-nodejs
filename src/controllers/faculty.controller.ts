// faculty.controller.ts
import { Request, Response } from 'express';
import { FacultyService } from '../services/faculty.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Faculty } from '../entities/Faculty';
import * as ExcelJS from 'exceljs';

export class FacultyController {
  private facultyService: FacultyService;

  constructor(dataSource: DataSource) {
    this.facultyService = new FacultyService(dataSource);
    this.importFaculty = this.importFaculty.bind(this);

  }

  public getAllFaculties = (req: Request, res: Response) => RequestHandler.getAll<Faculty>(req, res, this.facultyService);
  public getFacultyByFacultyId = (req: Request, res: Response) => {
    const facultyId = req.params.id;
    this.facultyService.getByFacultyId(facultyId)
      .then((faculty) => {
        if (faculty) {
          res.status(200).json({ success: true, data: faculty });
        } else {
          res.status(404).json({ success: false, message: 'Faculty not found' });
        }
      })
      .catch((err) => {
        console.error('Get Faculty By FacultyId Error:', err);
        res.status(500).json({ success: false, message: err.message });
      });
  }
  public getFacultyWhere = (req: Request, res: Response) => RequestHandler.getWhere<Faculty>(req, res, this.facultyService);
  public createFaculty = (req: Request, res: Response) => RequestHandler.create<Faculty>(req, res, this.facultyService);
  public updateFaculty = (req: Request, res: Response) => RequestHandler.update<Faculty>(req, res, this.facultyService);
  public deleteFaculty = (req: Request, res: Response) => RequestHandler.delete(req, res, this.facultyService);


  public async importFaculty(req: Request, res: Response) {
    try {
        const faculties = req.body;

        if (!Array.isArray(faculties)) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }

        await this.facultyService.importFaculty(faculties);

        res.status(200).json({ message: 'Import thành công' });
    } catch (error) {
        console.error('[FacultyController - importFaculty]:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi import dữ liệu' });
    }
  }

  public async importFaculties(req: Request, res: Response) {
    try {
      const faculties = req.body.data as any[];

      const results = [];
      const errors = [];

      for (const [index, row] of faculties.entries()) {
        try {
          // Validate data from Excel
          const facultyData = {
            facultyId: row[0]?.toString().trim(),
            facultyName: row[1]?.toString().trim()
          };

          // Basic validation
          if (!facultyData.facultyId || !facultyData.facultyName) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            continue;
          }

          // Check if faculty already exists
          const existing = await this.facultyService.getByFacultyId(facultyData.facultyId);
          if (existing) {
            errors.push(`Row ${index + 1}: Faculty ID ${facultyData.facultyId} already exists`);
            continue;
          }

          // Save to database
          const faculty = await this.facultyService.create(facultyData);
          results.push(faculty);

        } catch (error: any) {
          errors.push(`Row ${index + 1}: ${error.message}`);
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          imported: results.length,
          errors: errors,
          results: results
        }
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  public async downloadTemplate(req: Request, res: Response) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Faculty Import Template');

      // Add header
      worksheet.addRow(['Mã khoa', 'Tên khoa']);

      // Add format for header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      // Add sample data
      worksheet.addRow(['CNTT', 'Công nghệ thông tin']);

      // Set column widths
      worksheet.columns = [
        { width: 15 }, // Mã khoa
        { width: 30 }  // Tên khoa
      ];

      // Set content type
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=faculty-import-template.xlsx'
      );

      // Write to response
      await workbook.xlsx.write(res);
      res.end();

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

}