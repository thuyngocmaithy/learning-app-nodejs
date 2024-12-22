import { Router } from 'express';
import { SpecializationController } from '../controllers/specialization.controller';
import { AppDataSource } from '../data-source';

const specializationRouter = Router();
const specializationController = new SpecializationController(AppDataSource);

specializationRouter.get('/checkRelatedData', specializationController.checkRelatedData.bind(specializationController));
specializationRouter.post('/import', specializationController.importSpecialization);
specializationRouter.get('/', specializationController.getAllSpecializations);
specializationRouter.get('/getWhere', specializationController.getSpecializationWhere);
specializationRouter.get('/:id', specializationController.getSpecializationById);
specializationRouter.post('/', specializationController.createSpecialization);
specializationRouter.put('/:id', specializationController.updateSpecialization);
specializationRouter.delete('/', specializationController.deleteSpecialization);

export default specializationRouter;
