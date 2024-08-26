// src/routes/sguAuthRoutes.ts
import express from 'express';
import { SguAuthController } from '../controllers/sguAuth.controller';

const sguAuthRouter = express.Router();
const sguAuthController = new SguAuthController();

sguAuthRouter.post('/login-sgu', sguAuthController.loginToSgu);

export default sguAuthRouter;


//authSGU/login-sgu