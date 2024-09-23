import { Router } from 'express';
import { Subject_SemesterController } from '../controllers/subject_semester.controller';
import { AppDataSource } from '../data-source';


    const Subject_SemesteRouter = Router();
    const subject_semesterController = new Subject_SemesterController(AppDataSource);

    Subject_SemesteRouter.get('/', subject_semesterController.getAllSubject_Semesters);
    Subject_SemesteRouter.get('/:id', subject_semesterController.getSubject_SemesterById);
    Subject_SemesteRouter.post('/', subject_semesterController.createSubject_Semester);
    Subject_SemesteRouter.put('/:id', subject_semesterController.updateSubject_Semester);
    Subject_SemesteRouter.delete('/', subject_semesterController.updateSubject_Semester);

    export default Subject_SemesteRouter;

