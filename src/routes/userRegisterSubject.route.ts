import { Router } from 'express';
import { UserRegisterSubjectController } from '../controllers/user_register_subject.controller';
import { AppDataSource } from '../data-source';

const userRegisterSubjectRouter = Router();
const userRegisterSubjectController = new UserRegisterSubjectController(AppDataSource);

// Route để user đăng ký môn học
userRegisterSubjectRouter.post('/register', userRegisterSubjectController.registerSubject);

// Route để lấy danh sách môn học đã đăng ký của user
userRegisterSubjectRouter.get('/user/:userId', userRegisterSubjectController.getUserRegisteredSubjects);

// Route để xóa đăng ký môn học của user
userRegisterSubjectRouter.delete('/user/:userId/subject/:subjectId/semester/:semesterId', userRegisterSubjectController.deleteRegistration);

export default userRegisterSubjectRouter;
