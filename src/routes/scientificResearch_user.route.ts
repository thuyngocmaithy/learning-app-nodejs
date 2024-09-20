import { Router } from 'express';
import { ScientificResearch_UserController } from '../controllers/scientificResearch_user.controller';
import { AppDataSource } from '../data-source';

const scientificResearchUserRouter = Router();
const scientificResearchUserController = new ScientificResearch_UserController(AppDataSource);

scientificResearchUserRouter.get('/', scientificResearchUserController.getAllScientificResearchUser);
scientificResearchUserRouter.get('/highestGroup', scientificResearchUserController.getHighestGroupScientificResearchUser);
scientificResearchUserRouter.get('/getByUserIdAndSRGroupId', scientificResearchUserController.getSRUByUserIdAndSRGroupId);
scientificResearchUserRouter.get('/getByScientificResearchId', scientificResearchUserController.getByScientificResearchId);
scientificResearchUserRouter.get('/:id', scientificResearchUserController.getScientificResearchUserById);
scientificResearchUserRouter.post('/', scientificResearchUserController.createScientificResearchUser);
scientificResearchUserRouter.put('/:id', scientificResearchUserController.updateScientificResearchUser);
scientificResearchUserRouter.delete('/deleteByUserAndScientificResearch', scientificResearchUserController.deleteByUserAndScientificResearch);
scientificResearchUserRouter.delete('/:id', scientificResearchUserController.deleteScientificResearchUser);

export default scientificResearchUserRouter;
