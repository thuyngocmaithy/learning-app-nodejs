// src/routes/followerRoutes.ts
import { Router } from 'express';
import { FollowerController } from '../controllers/follower.controller';
import { AppDataSource } from '../data-source';


  const followerRouter = Router();
  const followerController = new FollowerController(AppDataSource);

  followerRouter.get('/', followerController.getAllFollowers);
  followerRouter.get('/:id', followerController.getFollowerById);
  followerRouter.post('/', followerController.createFollower);
  followerRouter.put('/:id', followerController.updateFollower);
  followerRouter.delete('/:id', followerController.deleteFollower);

  export default followerRouter;

