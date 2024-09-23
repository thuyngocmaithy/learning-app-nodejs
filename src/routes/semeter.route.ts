import { Router } from 'express';
import { SemesterController } from '../controllers/semeter.controller';
import { AppDataSource } from '../data-source';

const semesterRouter = Router();
const semesterController = new SemesterController(AppDataSource);

semesterRouter.get('/', semesterController.getAllSemesters);
semesterRouter.get('/:id', semesterController.getSemesterById);
semesterRouter.post('/', semesterController.createSemester);
semesterRouter.put('/:id', semesterController.updateSemester);
semesterRouter.delete('/', semesterController.deleteSemester);

export default semesterRouter;