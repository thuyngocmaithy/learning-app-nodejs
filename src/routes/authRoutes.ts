// Trong authRoutes.ts
import express from 'express';
import { registerController, loginController, refreshTokenController } from '../controllers/auth/auth.controller';

const router = express.Router();

router.post('/register', registerController);
router.post('api/login', loginController);
router.post('/refresh-token', refreshTokenController);
export default router;
