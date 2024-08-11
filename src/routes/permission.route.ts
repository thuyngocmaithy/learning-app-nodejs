import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { AppDataSource } from '../data-source';


const permissionRouter = Router();
const permissionController = new PermissionController(AppDataSource);

permissionRouter.get('/', permissionController.getAllPermissions);
permissionRouter.get('/:id', permissionController.getPermissionByPermissionId);
permissionRouter.post('/', permissionController.createPermission);
permissionRouter.put('/:id', permissionController.updatePermission);
permissionRouter.delete('/:id', permissionController.deletePermission);

export default permissionRouter;
