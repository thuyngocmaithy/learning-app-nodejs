import { Router } from 'express';
import { Internship_UserController } from '../controllers/internship_faculty.controller';
import { AppDataSource } from '../data-source';


const internshipUserRouter = Router();
const internshipUserController = new Internship_UserController(AppDataSource);

internshipUserRouter.get('/', internshipUserController.getAllInternshipUser);
internshipUserRouter.get('/:id', internshipUserController.getInternshipUserById);
internshipUserRouter.post('/', internshipUserController.createInternshipUser);
internshipUserRouter.put('/:id', internshipUserController.updateInternshipUser);
internshipUserRouter.delete('/:id', internshipUserController.deleteInternshipUser);

export default internshipUserRouter;
