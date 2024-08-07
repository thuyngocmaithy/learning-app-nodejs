import express from 'express';
import { loginController, refreshTokenController } from '../controllers/auth.controller'; // Import các controller

const authRouter = express.Router();

authRouter.post('/login', loginController);
authRouter.post('/refresh-token', refreshTokenController);

export default authRouter;
