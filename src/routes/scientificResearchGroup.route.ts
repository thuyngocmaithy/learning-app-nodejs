// src/routes/scientificResearchGroupRoutes.ts
import { Router } from 'express';
import { ScientificResearchGroupController } from '../controllers/scientificResearchGroup.controller';
import { AppDataSource } from '../data-source';


const scientificResearchGroupRouter = Router();
const scientificResearchGroupController = new ScientificResearchGroupController(AppDataSource);

scientificResearchGroupRouter.get('/', scientificResearchGroupController.getAllScientificResearchGroups);
scientificResearchGroupRouter.get('/:id', scientificResearchGroupController.getScientificResearchGroupById);
scientificResearchGroupRouter.post('/', scientificResearchGroupController.createScientificResearchGroup);
scientificResearchGroupRouter.put('/:id', scientificResearchGroupController.updateScientificResearchGroup);
scientificResearchGroupRouter.delete('/:id', scientificResearchGroupController.deleteScientificResearchGroup);

export default scientificResearchGroupRouter;

