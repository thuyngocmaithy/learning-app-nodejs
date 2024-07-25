// src/routes/authRoutes.ts
import express from 'express';
import { registerController, loginController, refreshTokenController } from '../controllers/auth/auth.controller';

const router = express.Router();

// Định nghĩa các tuyến đường cho các API xác thực
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/refresh-token', refreshTokenController);

export default router;
