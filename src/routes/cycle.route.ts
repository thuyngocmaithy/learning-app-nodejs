// src/routes/cycleRoutes.ts
import { Router } from 'express';
import { CycleController } from '../controllers/cycle.controller';
import { AppDataSource } from '../data-source';

const cycleRouter = Router();
const cycleController = new CycleController(AppDataSource);

cycleRouter.get('/', cycleController.getAllCycles);
cycleRouter.get('/:id', cycleController.getCycleById);
cycleRouter.post('/', cycleController.createCycle);
cycleRouter.put('/:id', cycleController.updateCycle);
cycleRouter.delete('/', cycleController.deleteCycle);

export default cycleRouter;
