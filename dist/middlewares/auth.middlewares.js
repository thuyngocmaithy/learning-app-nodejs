"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseHelper_1 = require("../utils/responseHelper");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return await (0, responseHelper_1.response)(res, 401, 'error', null, 'Access token not found');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.account = decoded;
        next();
    }
    catch (error) {
        return await (0, responseHelper_1.response)(res, 403, 'error', null, 'Invalid or expired token');
    }
};
exports.authMiddleware = authMiddleware;
