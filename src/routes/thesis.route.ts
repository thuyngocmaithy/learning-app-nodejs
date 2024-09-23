// src/routes/thesisRoutes.ts
import { Router } from 'express';
import { ThesisController } from '../controllers/thesis.controller';
import { AppDataSource } from '../data-source';


    const thesisRouter = Router();
    const thesisController = new ThesisController(AppDataSource);

    thesisRouter.get('/', thesisController.getAllTheses);
    thesisRouter.get('/:id', thesisController.getThesisById);
    thesisRouter.post('/', thesisController.createThesis);
    thesisRouter.put('/:id', thesisController.updateThesis);
    thesisRouter.delete('/', thesisController.deleteThesis);

    export default thesisRouter;
