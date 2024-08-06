import { Router } from 'express';
import { Internship_FacultyController } from '../controllers/internship_faculty.controller';
import { AppDataSource } from '../data-source';


  const internshipFacultyRouter = Router();
  const internshipFacultyController = new Internship_FacultyController(AppDataSource);

  internshipFacultyRouter.get('/', internshipFacultyController.getAllInternshipFaculties);
  internshipFacultyRouter.get('/:id', internshipFacultyController.getInternshipFacultyById);
  internshipFacultyRouter.post('/', internshipFacultyController.createInternshipFaculty);
  internshipFacultyRouter.put('/:id', internshipFacultyController.updateInternshipFaculty);
  internshipFacultyRouter.delete('/:id', internshipFacultyController.deleteInternshipFaculty);

  export default internshipFacultyRouter;
