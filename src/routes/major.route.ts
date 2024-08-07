// src/routes/majorRoutes.ts
import { Router } from 'express';
import { MajorController } from '../controllers/major.controller';
import { AppDataSource } from '../data-source';


    const majorRouter = Router();
    const majorController = new MajorController(AppDataSource);

    majorRouter.get('/', majorController.getAllMajors);
    majorRouter.get('/:id', majorController.getMajorById);
    majorRouter.post('/', majorController.createMajor);
    majorRouter.put('/:id', majorController.updateMajor);
    majorRouter.delete('/:id', majorController.deleteMajor);

    export default majorRouter;
