// src/routes/facultyRoutes.ts
import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { AppDataSource } from '../data-source';


const facultyRouter = Router();
const facultyController = new FacultyController(AppDataSource);

facultyRouter.get('/', facultyController.getAllFaculties);
facultyRouter.get('/:id', facultyController.getFacultyByFacultyId);
facultyRouter.post('/', facultyController.createFaculty);
facultyRouter.put('/:id', facultyController.updateFaculty);
facultyRouter.delete('/:id', facultyController.deleteFaculty);


export default facultyRouter;
