// faculty.controller.ts
import { Request, Response } from 'express';
import { FacultyService } from '../services/faculty.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Faculty } from '../entities/Faculty';

export class FacultyController {
  private facultyService: FacultyService;

  constructor(dataSource: DataSource) {
    this.facultyService = new FacultyService(dataSource);
  }

  public getAllFaculties = (req: Request, res: Response) => RequestHandler.getAll<Faculty>(req, res, this.facultyService);
  public getFacultyByFacultyId = (req: Request, res: Response) => {
    const facultyId = req.params.facultyId;
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
  public createFaculty = (req: Request, res: Response) => RequestHandler.create<Faculty>(req, res, this.facultyService);
  public updateFaculty = (req: Request, res: Response) => RequestHandler.update<Faculty>(req, res, this.facultyService);
  public deleteFaculty = (req: Request, res: Response) => RequestHandler.delete(req, res, this.facultyService);
}