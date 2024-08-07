import { Router } from 'express';
import { StatusController } from '../controllers/status.controller';
import { AppDataSource } from '../data-source';


    const statusRouter = Router();
    const statusController = new StatusController(AppDataSource);

    statusRouter.get('/', statusController.getAllStatuses);
    statusRouter.get('/:id', statusController.getStatusById);
    statusRouter.post('/', statusController.createStatus);
    statusRouter.put('/:id', statusController.updateStatus);
    statusRouter.delete('/:id', statusController.deleteStatus);

    export default statusRouter;
