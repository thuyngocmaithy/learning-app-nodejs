import { Router } from 'express';
import { FrameStructureController } from '../controllers/frameStructure.controller';
import { AppDataSource } from '../data-source';


const frameStructureRouter = Router();
const frameStructureController = new FrameStructureController(AppDataSource);

frameStructureRouter.get('/', frameStructureController.getAllFrameStructures);
frameStructureRouter.post('/saveTreeStructure', frameStructureController.saveTreeDataController);
frameStructureRouter.get('/getWhere', frameStructureController.getFrameStructureWhere);
frameStructureRouter.get('/:id', frameStructureController.getFrameStructureById);
frameStructureRouter.post('/', frameStructureController.createFrameStructure);
frameStructureRouter.put('/:id', frameStructureController.updateFrameStructure);
frameStructureRouter.delete('/', frameStructureController.deleteFrameStructure);

export default frameStructureRouter;

