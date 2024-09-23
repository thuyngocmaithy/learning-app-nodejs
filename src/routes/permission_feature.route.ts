import { Router } from 'express';
import { PermissionFeatureController } from '../controllers/permission_feature.controller';
import { AppDataSource } from '../data-source';


const permissionFeatureRouter = Router();
const permissionFeatureController = new PermissionFeatureController(AppDataSource);

permissionFeatureRouter.get('/', permissionFeatureController.getAllPermissionFeatures);
permissionFeatureRouter.get('/getPermisisonFeatureWhere', permissionFeatureController.getPermissionFeatureWhere);
permissionFeatureRouter.get('/:id', permissionFeatureController.getPermissionFeatureById);
permissionFeatureRouter.post('/', permissionFeatureController.createPermissionFeature);
permissionFeatureRouter.put('/:id', permissionFeatureController.updatePermissionFeature);
permissionFeatureRouter.delete('/', permissionFeatureController.deletePermissionFeature);

export default permissionFeatureRouter;
