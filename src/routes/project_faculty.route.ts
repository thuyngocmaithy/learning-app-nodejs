import { Router } from 'express';
import { Project_FacultyController } from '../controllers/project_faculty.controller';
import { AppDataSource } from '../data-source';

  const projectFacultyRouter = Router();
  const projectFacultyController = new Project_FacultyController(AppDataSource);

  projectFacultyRouter.get('/', projectFacultyController.getAllProjectFaculties);
  projectFacultyRouter.get('/:id', projectFacultyController.getProjectFacultyById);
  projectFacultyRouter.post('/', projectFacultyController.createProjectFaculty);
  projectFacultyRouter.put('/:id', projectFacultyController.updateProjectFaculty);
  projectFacultyRouter.delete('/:id', projectFacultyController.deleteProjectFaculty);

  export default projectFacultyRouter;
