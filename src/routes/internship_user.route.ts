import { Router } from 'express';
import { Internship_UserController } from '../controllers/internship_user.controller';
import { AppDataSource } from '../data-source';


const internshipUserRouter = Router();
const internshipUserController = new Internship_UserController(AppDataSource);

internshipUserRouter.get('/', internshipUserController.getAllInternshipUser);
internshipUserRouter.get('/:id', internshipUserController.getInternshipUserById);
internshipUserRouter.post('/', internshipUserController.createInternshipUser);
internshipUserRouter.put('/:id', internshipUserController.updateInternshipUser);
internshipUserRouter.delete('/', internshipUserController.deleteInternshipUser);

export default internshipUserRouter;
