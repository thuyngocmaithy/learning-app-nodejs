import { Router } from 'express';
import { ComponentScoreController } from '../controllers/componentScore.controller';
import { AppDataSource } from '../data-source';


  const componentScoreRouter = Router();
  const componentScoreController = new ComponentScoreController(AppDataSource);

  componentScoreRouter.get('/', componentScoreController.getAllComponentScores);
  componentScoreRouter.get('/:id', componentScoreController.getComponentScoreById);
  componentScoreRouter.post('/', componentScoreController.createComponentScore);
  componentScoreRouter.put('/:id', componentScoreController.updateComponentScore);
  componentScoreRouter.delete('/:id', componentScoreController.deleteComponentScore);

  export default componentScoreRouter;
