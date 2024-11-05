// src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import { AppDataSource } from '../data-source';

const userRouter = Router();
const userController = new UserController(AppDataSource);

userRouter.get('/teachers', userController.getActiveNonStudents);
userRouter.get('/students', userController.getActiveStudents);
userRouter.get('/users-by-faculty/:facultyId', userController.getUsersByFaculty);
userRouter.post('/import', userController.addUserFromExcel);
userRouter.get('/', userController.getAllUsers);
userRouter.get('/:userId', userController.getUserByUserId);
userRouter.post('/', userController.createUser);
userRouter.put('/:id', userController.updateUser);
userRouter.delete('/', userController.deleteUser);

export default userRouter;