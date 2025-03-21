import { Router } from 'express';
import { MajorController } from '../controllers/major.controller';
import { AppDataSource } from '../data-source';

const majorRouter = Router();
const majorController = new MajorController(AppDataSource);

majorRouter.get('/checkRelatedData', majorController.checkRelatedData.bind(majorController));
majorRouter.post('/import', majorController.importMajor);
majorRouter.get('/', majorController.getAllMajors);
majorRouter.get('/getWhere', majorController.getMajorWhere);
majorRouter.get('/:id', majorController.getMajorById);
majorRouter.post('/', majorController.createMajor);
majorRouter.put('/:id', majorController.updateMajor);
majorRouter.delete('/', majorController.deleteMajor);

export default majorRouter;
