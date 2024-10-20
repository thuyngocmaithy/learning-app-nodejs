import { Router } from 'express';
import { MegaController } from '../controllers/mega.controller';
import { AppDataSource } from '../data-source';

const router = Router();
const megaController = new MegaController(AppDataSource);

// Route để upload file lên MEGA
router.post('/upload', megaController.uploadFiles);
// Route để download file từ MEGA
router.get('/download/:fileId', megaController.downloadFile);

export default router;
