import { Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken } from '../../services/authService';
import User from '../../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import randToken from 'rand-token';
import { response } from '../../utils/responseHelper';


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerController = async (req: Request, res: Response): Promise<void> => {
    const { email, password, mssv } = req.body;
  
    try {
      const newUser = await registerUser(email, password, mssv);
      await response(res, 201, 'success', { user: newUser }, 'User registered successfully');
    } catch (error) {
      await response(res, 400, 'error', null, error instanceof Error ? error.message : 'Registration failed');
    }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
    console.log('Received login request:', req.body); // Debugging line
    const { mssv, password } = req.body;
    
    try {
        const { accessToken, refreshToken, expiresIn } = await loginUser(mssv, password);
        await response(res, 200, 'success', { accessToken, refreshToken, expiresIn }, 'Login successful');
    } catch (error) {
        await response(res, 401, 'error', null, error instanceof Error ? error.message : 'Login failed');
    }
};
  
export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
  
    try {
      const accessToken = await refreshAccessToken(refreshToken);
      await response(res, 200, 'success', { accessToken }, 'Access token refreshed successfully');
    } catch (error) {
      await response(res, 401, 'error', null, error instanceof Error ? error.message : 'Token refresh failed');
    }
};
