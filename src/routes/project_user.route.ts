import { Router } from 'express';
import { Project_UserController } from '../controllers/project_faculty.controller';
import { AppDataSource } from '../data-source';

const projectUserRouter = Router();
const projectUserController = new Project_UserController(AppDataSource);

projectUserRouter.get('/', projectUserController.getAllProjectUser);
projectUserRouter.get('/:id', projectUserController.getProjectUserById);
projectUserRouter.post('/', projectUserController.createProjectUser);
projectUserRouter.put('/:id', projectUserController.updateProjectUser);
projectUserRouter.delete('/:id', projectUserController.deleteProjectUser);

export default projectUserRouter;
