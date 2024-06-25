// Trong authRoutes.ts
import express from 'express';
import { registerController, loginController, refreshTokenController } from '../controllers/auth/auth.controller';

const authRouter = express.Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.post('/refresh-token', refreshTokenController);
export default authRouter;
