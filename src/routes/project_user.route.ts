import { Router } from 'express';
import { Project_UserController } from '../controllers/project_user.controller';
import { AppDataSource } from '../data-source';

const projectUserRouter = Router();
const projectUserController = new Project_UserController(AppDataSource);

projectUserRouter.get('/', projectUserController.getAllProjectUser);
projectUserRouter.get('/highestGroup', projectUserController.getHighestGroupProjectUser);
projectUserRouter.get('/getByUserId', projectUserController.getProjectUserByUserId);
projectUserRouter.get('/getByProjectId', projectUserController.getProjectUserByProjectId);
projectUserRouter.get('/:id', projectUserController.getProjectUserById);
projectUserRouter.post('/', projectUserController.createProjectUser);
projectUserRouter.put('/:id', projectUserController.updateProjectUser);
projectUserRouter.delete('/deleteByUserAndProject', projectUserController.deleteProjectUserByUserAndProject);
projectUserRouter.delete('/:id', projectUserController.deleteProjectUser);

export default projectUserRouter;
