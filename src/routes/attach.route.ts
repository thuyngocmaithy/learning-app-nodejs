// src/routes/attachRoutes.ts
import { Router } from 'express';
import { AttachController } from '../controllers/attach.controller';
import { AppDataSource } from '../data-source';


  const attachRouter = Router();
  const attachController = new AttachController(AppDataSource);

  attachRouter.get('/attachments', attachController.getAllAttachments.bind(attachController));
  attachRouter.get('/attachments/:id', attachController.getAttachmentById.bind(attachController));
  attachRouter.post('/attachments', attachController.createAttachment.bind(attachController));
  attachRouter.put('/attachments/:id', attachController.updateAttachment.bind(attachController));
  attachRouter.delete('/attachments/:id', attachController.deleteAttachment.bind(attachController));

  export default attachRouter;

