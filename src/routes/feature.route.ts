// src/routes/featureRoutes.ts
import { Router } from 'express';
import { FeatureController } from '../controllers/feature.controller';
import { AppDataSource } from '../data-source';


const featureRouter = Router();
const featureController = new FeatureController(AppDataSource);

featureRouter.get('/', featureController.getAllFeatures);
featureRouter.get('/checkRelatedData', featureController.checkRelatedData.bind(featureController));
featureRouter.post('/saveTreeFeature', featureController.saveTreeDataController);
featureRouter.get('/getFeatureWhereParentAndKeyRoute', featureController.getFeatureWhereParentAndKeyRoute);
featureRouter.get('/:id', featureController.getFeatureById);
featureRouter.post('/', featureController.createFeature);
featureRouter.put('/:id', featureController.updateFeature);
featureRouter.delete('/', featureController.deleteFeature);


export default featureRouter;
