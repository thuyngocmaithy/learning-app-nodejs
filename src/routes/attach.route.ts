// src/routes/attachRoutes.ts
import { Router } from 'express';
import { AttachController } from '../controllers/attach.controller';
import { AppDataSource } from '../data-source';


const attachRouter = Router();
const attachController = new AttachController(AppDataSource);

attachRouter.get('/', attachController.getAllAttachments.bind(attachController));
attachRouter.get('/getWhere', attachController.getAttachmentWhere);
attachRouter.get('/:id', attachController.getAttachmentById.bind(attachController));
attachRouter.post('/', attachController.createAttachment.bind(attachController));
attachRouter.put('/:id', attachController.updateAttachment.bind(attachController));
attachRouter.delete('/:id', attachController.deleteAttachment.bind(attachController));

export default attachRouter;

