// src/routes/academicYearRoutes.ts
import { Router } from 'express';
import { AcademicYearController } from '../controllers/academicYear.controller';
import { AppDataSource } from '../data-source';


    const academicYearRouter = Router();
    const academicYearController = new AcademicYearController(AppDataSource);

    academicYearRouter.get('/', academicYearController.getAllAcademicYears);
    academicYearRouter.get('/:id', academicYearController.getAcademicYearById);
    academicYearRouter.post('/', academicYearController.createAcademicYear);
    academicYearRouter.put('/:id', academicYearController.updateAcademicYear);
    academicYearRouter.delete('/:id', academicYearController.deleteAcademicYear);

    export default academicYearRouter;
