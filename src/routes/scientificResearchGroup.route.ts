// src/routes/scientificResearchGroupRoutes.ts
import { Router } from 'express';
import { ScientificResearchGroupController } from '../controllers/scientificResearchGroup.controller';
import { AppDataSource } from '../data-source';


const scientificResearchGroupRoute = Router();
const scientificResearchGroupController = new ScientificResearchGroupController(AppDataSource);

scientificResearchGroupRoute.post('/import', scientificResearchGroupController.importScientificReasearchGroup);
scientificResearchGroupRoute.get('/', scientificResearchGroupController.getAllScientificResearchGroups);
scientificResearchGroupRoute.put('/updateSRGMulti/:ids', scientificResearchGroupController.updateScientificResearchGroupMulti);
scientificResearchGroupRoute.get('/getWhere', scientificResearchGroupController.getSRGWhere);
scientificResearchGroupRoute.get('/checkValidDateCreateSR', scientificResearchGroupController.checkValidDateCreateSR);
scientificResearchGroupRoute.get('/:id', scientificResearchGroupController.getScientificResearchGroupById);
scientificResearchGroupRoute.post('/', scientificResearchGroupController.createScientificResearchGroup);
scientificResearchGroupRoute.put('/:id', scientificResearchGroupController.updateScientificResearchGroup);
scientificResearchGroupRoute.delete('/', scientificResearchGroupController.deleteScientificResearchGroup);


export default scientificResearchGroupRoute;

