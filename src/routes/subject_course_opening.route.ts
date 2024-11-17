import { Router } from 'express';
import { Subject_Course_OpeningController } from '../controllers/subject_course_opening.controller';
import { AppDataSource } from '../data-source';

const subject_course_openingRouter = Router();
const subject_course_openingController = new Subject_Course_OpeningController(AppDataSource);

subject_course_openingRouter.get('/', subject_course_openingController.getAllSubjectCourseOpenings);
subject_course_openingRouter.get('/teacher-assignments', subject_course_openingController.getTeacherAssignmentsAndSemesters);
subject_course_openingRouter.get('/getWhere', subject_course_openingController.getSubjectCourseOpeningWhere);
subject_course_openingRouter.get('/:id', subject_course_openingController.getSubjectCourseOpeningById);
subject_course_openingRouter.post('/saveMulti', subject_course_openingController.saveMulti);
subject_course_openingRouter.post('/', subject_course_openingController.createSubjectCourseOpening);
subject_course_openingRouter.put('/:id', subject_course_openingController.updateSubjectCourseOpening);
subject_course_openingRouter.delete('/', subject_course_openingController.deleteSubjectCourseOpening);

export default subject_course_openingRouter;