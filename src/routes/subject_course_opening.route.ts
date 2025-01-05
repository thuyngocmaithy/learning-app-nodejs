import { Router } from 'express';
import { Subject_Course_OpeningController } from '../controllers/subject_course_opening.controller';
import { AppDataSource } from '../data-source';

const subject_course_openingRouter = Router();
const subject_course_openingController = new Subject_Course_OpeningController(AppDataSource);

subject_course_openingRouter.get('/', subject_course_openingController.getAllSubjectCourseOpenings);
subject_course_openingRouter.get('/getWhere', subject_course_openingController.getSubjectCourseOpeningWhere);
subject_course_openingRouter.get('/:id', subject_course_openingController.getSubjectCourseOpeningById);
subject_course_openingRouter.post('/grouped-by-subject', subject_course_openingController.getGroupedBySubjectForSemesters);
subject_course_openingRouter.post('/saveMulti', subject_course_openingController.saveMultiSubjectCourseOpenings);
subject_course_openingRouter.put('/:id', subject_course_openingController.updateSubjectCourseOpening);
subject_course_openingRouter.delete('/:semesterId/:majorId', subject_course_openingController.deleteSubjectCourseOpening);

export default subject_course_openingRouter;