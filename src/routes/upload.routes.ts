import { Router } from 'express';
import { uploadFile, handleUpload } from '../controllers/upload.controller';
import { fileValidation } from '../middlewares/fileValidation.middleware';

const uploadRouter = Router();

// Định nghĩa route upload
uploadRouter.post('/', uploadFile, fileValidation, handleUpload);

export default uploadRouter;
