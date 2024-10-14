// src/routes/scientificResearchRoutes.ts
import { Router } from 'express';
import { ScientificResearchController } from '../controllers/scientificResearch.controller';
import { AppDataSource } from '../data-source';


const scientificResearchRouter = Router();
const scientificResearchController = new ScientificResearchController(AppDataSource);

scientificResearchRouter.get('/', scientificResearchController.getAllScientificResearchs);
scientificResearchRouter.get('/getByScientificResearchGroupId', scientificResearchController.getByScientificResearchIGroupId);
scientificResearchRouter.get('/getBySRGIdAndCheckApprove', scientificResearchController.getBySRGIdAndCheckApprove);
scientificResearchRouter.get('/getWhere', scientificResearchController.getPermissionFeatureWhere);
scientificResearchRouter.put('/updateSRMulti/:ids', scientificResearchController.updateScientificResearchMulti);
scientificResearchRouter.get('/:id', scientificResearchController.getScientificResearchById);
scientificResearchRouter.post('/', scientificResearchController.createScientificResearch);
scientificResearchRouter.put('/:id', scientificResearchController.updateScientificResearch);
scientificResearchRouter.delete('/', scientificResearchController.deleteScientificResearch);

export default scientificResearchRouter;

