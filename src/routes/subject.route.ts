// src/routes/subjectRoutes.ts
import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { AppDataSource } from '../data-source';

const subjectRouter = Router();
const subjectController = new SubjectController(AppDataSource);

subjectRouter.get('/faculty/:facultyId', subjectController.getSubjectByFacultyId);
subjectRouter.get('/getWhere', subjectController.getSubjectWhere);
subjectRouter.get('/detail/', subjectController.getAllSubjectDetail);
subjectRouter.get('/', subjectController.getAllSubjects);
subjectRouter.get('/:id', subjectController.getSubjectById);
subjectRouter.post('/', subjectController.createSubject);
subjectRouter.put('/:id', subjectController.updateSubject);
subjectRouter.delete('/', subjectController.deleteSubject);


export default subjectRouter;

