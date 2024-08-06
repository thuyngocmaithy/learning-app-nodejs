// src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import { AppDataSource } from '../data-source';


    const userRouter = Router();
    const userController = new UserController(AppDataSource);

    userRouter.get('/', userController.getAllUsers);
    userRouter.get('/:id', userController.getUserById);
    userRouter.post('/', userController.createUser);
    userRouter.put('/:id', userController.updateUser);
    userRouter.delete('/:id', userController.deleteUser);

    export default userRouter;
