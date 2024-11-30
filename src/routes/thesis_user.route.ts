import { Router } from 'express';
import { Thesis_UserController } from '../controllers/thesis_user.controller';
import { AppDataSource } from '../data-source';

const thesisRouter = Router();
const thesisController = new Thesis_UserController(AppDataSource);

thesisRouter.get('/', thesisController.getAllThesisUser);
thesisRouter.get('/getByListThesisId/:ids', thesisController.getByListThesisId);
thesisRouter.get('/highestGroup', thesisController.getHighestGroupThesisUser);
thesisRouter.get('/getWhere', thesisController.getThesisUserWhere);
thesisRouter.get('/getByThesisId', thesisController.getByThesisId);
thesisRouter.get('/:id', thesisController.getThesisUserById);
thesisRouter.post('/', thesisController.createThesisUser);
thesisRouter.put('/:id', thesisController.updateThesisUser);
thesisRouter.delete('/deleteByUserAndThesis', thesisController.deleteByUserAndThesis);
thesisRouter.delete('/', thesisController.deleteThesisUser);

export default thesisRouter;
