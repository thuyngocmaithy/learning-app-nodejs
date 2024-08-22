import { Router } from 'express';
import { Thesis_UserController } from '../controllers/thesis_faculty.controller';
import { AppDataSource } from '../data-source';


const thesisUserRouter = Router();
const thesis_UserController = new Thesis_UserController(AppDataSource);

thesisUserRouter.get('/', thesis_UserController.getAllThesisUser);
thesisUserRouter.get('/:id', thesis_UserController.getThesisUserById);
thesisUserRouter.post('/', thesis_UserController.createThesisUser);
thesisUserRouter.put('/:id', thesis_UserController.updateThesisUser);
thesisUserRouter.delete('/:id', thesis_UserController.deleteThesisUser);

export default thesisUserRouter;
