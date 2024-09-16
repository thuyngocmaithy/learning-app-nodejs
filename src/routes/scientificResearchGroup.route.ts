// src/routes/scientificResearchGroupRoutes.ts
import { Router } from 'express';
import { ScientificResearchGroupController } from '../controllers/scientificResearchGroup.controller';
import { AppDataSource } from '../data-source';


const scientificResearchGroupRoute = Router();
const scientificResearchGroupController = new ScientificResearchGroupController(AppDataSource);

scientificResearchGroupRoute.get('/', scientificResearchGroupController.getAllScientificResearchGroups);
scientificResearchGroupRoute.get('/:id', scientificResearchGroupController.getScientificResearchGroupById);
scientificResearchGroupRoute.post('/', scientificResearchGroupController.createScientificResearchGroup);
scientificResearchGroupRoute.put('/:id', scientificResearchGroupController.updateScientificResearchGroup);
scientificResearchGroupRoute.delete('/:id', scientificResearchGroupController.deleteScientificResearchGroup);

export default scientificResearchGroupRoute;

