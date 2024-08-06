// src/routes/projectRoutes.ts
import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { AppDataSource } from '../data-source';


    const projectRouter = Router();
    const projectController = new ProjectController(AppDataSource);

    projectRouter.get('/', projectController.getAllProjects);
    projectRouter.get('/:id', projectController.getProjectById);
    projectRouter.post('/', projectController.createProject);
    projectRouter.put('/:id', projectController.updateProject);
    projectRouter.delete('/:id', projectController.deleteProject);

    export default projectRouter;

