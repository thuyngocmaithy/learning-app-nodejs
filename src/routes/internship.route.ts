// src/routes/internshipRoutes.ts
import { Router } from 'express';
import { InternshipController } from '../controllers/internship.controller';
import { AppDataSource } from '../data-source';


    const internshipRouter = Router();
    const internshipController = new InternshipController(AppDataSource);

    internshipRouter.get('/', internshipController.getAllInternships);
    internshipRouter.get('/:id', internshipController.getInternshipById);
    internshipRouter.post('/', internshipController.createInternship);
    internshipRouter.put('/:id', internshipController.updateInternship);
    internshipRouter.delete('/', internshipController.deleteInternship);

    export default internshipRouter;

