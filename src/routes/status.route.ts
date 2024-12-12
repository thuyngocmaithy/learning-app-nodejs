import { Router } from 'express';
import { StatusController } from '../controllers/status.controller';
import { AppDataSource } from '../data-source';


const statusRouter = Router();
const statusController = new StatusController(AppDataSource);

statusRouter.post('/import', statusController.importStatus);
statusRouter.get('/type', statusController.getStatusByType);
statusRouter.get('/checkRelatedData', statusController.checkRelatedData.bind(statusController));
statusRouter.get('/getWhere', statusController.getStatusWhere);
statusRouter.get('/', statusController.getAllStatuses);
statusRouter.get('/:id', statusController.getStatusById);
statusRouter.post('/', statusController.createStatus);
statusRouter.put('/:id', statusController.updateStatus);
statusRouter.delete('/', statusController.deleteStatus);

export default statusRouter;
