// src/routes/followerDetailRoutes.ts
import { Router } from 'express';
import { FollowerDetailController } from '../controllers/followerDetail.controller';
import { AppDataSource } from '../data-source';


const followerDetailRouter = Router();
const followerDetailController = new FollowerDetailController(AppDataSource);

followerDetailRouter.get('/', followerDetailController.getAllFollowerDetails);
followerDetailRouter.get('/:id', followerDetailController.getFollowerDetailById);
followerDetailRouter.post('/', followerDetailController.createFollowerDetail);
followerDetailRouter.put('/:id', followerDetailController.updateFollowerDetail);
followerDetailRouter.delete('/', followerDetailController.deleteFollowerDetail);
followerDetailRouter.delete('/deleteFollowerDetailBySRIdAndUserId', followerDetailController.deleteFollowerDetailBySRIdAndUserId);
followerDetailRouter.delete('/deleteFollowerDetailByThesisIdAndUserId', followerDetailController.deleteFollowerDetailByThesisIdAndUserId);

export default followerDetailRouter;

