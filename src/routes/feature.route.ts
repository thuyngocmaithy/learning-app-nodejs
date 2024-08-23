// src/routes/featureRoutes.ts
import { Router } from 'express';
import { FeatureController } from '../controllers/feature.controller';
import { AppDataSource } from '../data-source';


const featureRouter = Router();
const featureController = new FeatureController(AppDataSource);

featureRouter.get('/', featureController.getAllFeatures);
featureRouter.get('/getFeatureByStructure', featureController.GetFeatureByStructure);
featureRouter.get('/:id', featureController.getFeatureById);
featureRouter.post('/', featureController.createFeature);
featureRouter.put('/:id', featureController.updateFeature);
featureRouter.delete('/:id', featureController.deleteFeature);


export default featureRouter;
