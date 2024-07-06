"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenController = exports.loginController = exports.registerController = void 0;
const authService_1 = require("../../services/authService");
const responseHelper_1 = require("../../utils/responseHelper");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const registerController = async (req, res) => {
    const { email, password, mssv } = req.body;
    try {
        const newAccount = await (0, authService_1.registerAccount)(email, password, mssv);
        await (0, responseHelper_1.response)(res, 201, 'success', { Account: newAccount }, 'Account registered successfully');
    }
    catch (error) {
        await (0, responseHelper_1.response)(res, 400, 'error', null, error instanceof Error ? error.message : 'Registration failed');
    }
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    console.log('Received login request:', req.body); // Debugging line
    const { mssv, password } = req.body;
    try {
        const { accessToken, refreshToken, expiresIn } = await (0, authService_1.loginAccount)(mssv, password);
        await (0, responseHelper_1.response)(res, 200, 'success', { accessToken, refreshToken, expiresIn }, 'Login successful');
    }
    catch (error) {
        await (0, responseHelper_1.response)(res, 401, 'error', null, error instanceof Error ? error.message : 'Login failed');
    }
};
exports.loginController = loginController;
const refreshTokenController = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const accessToken = await (0, authService_1.refreshAccessToken)(refreshToken);
        await (0, responseHelper_1.response)(res, 200, 'success', { accessToken }, 'Access token refreshed successfully');
    }
    catch (error) {
        await (0, responseHelper_1.response)(res, 401, 'error', null, error instanceof Error ? error.message : 'Token refresh failed');
    }
};
exports.refreshTokenController = refreshTokenController;
