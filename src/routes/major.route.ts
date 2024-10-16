// src/routes/majorRoutes.ts
import { Router } from 'express';
import { MajorController } from '../controllers/major.controller';
import { AppDataSource } from '../data-source';

const majorRouter = Router();
const majorController = new MajorController(AppDataSource);

// New routes
majorRouter.get('/facultyId/:facultyId', majorController.getMajorByFacultyId);
majorRouter.get('/facultyName/:facultyName', majorController.getMajorByFacultyName);
majorRouter.get('/', majorController.getAllMajors);
majorRouter.get('/:id', majorController.getMajorById);
majorRouter.post('/', majorController.createMajor);
majorRouter.put('/:id', majorController.updateMajor);
majorRouter.delete('/', majorController.deleteMajor);



export default majorRouter;

