"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.loginAccount = exports.registerAccount = void 0;
const account_model_1 = __importDefault(require("../models/account.model"));
const config_1 = require("../utils/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const registerAccount = async (email, password, mssv) => {
    if (!(0, config_1.validateEmail)(email)) {
        throw new Error('Invalid email format');
    }
    if (!(0, config_1.validatePassword)(password)) {
        throw new Error('Invalid password format');
    }
    if (!(0, config_1.validateMSSV)(mssv)) {
        throw new Error('Invalid MSSV format');
    }
    const existingAccount = await account_model_1.default.findOne({ $or: [{ email }, { mssv }] });
    if (existingAccount) {
        throw new Error('Account with this email or MSSV already exists');
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newAccount = new account_model_1.default({
        email,
        password: hashedPassword,
        mssv
    });
    await newAccount.save();
    return newAccount;
};
exports.registerAccount = registerAccount;
const loginAccount = async (mssv, password) => {
    const account = await account_model_1.default.findOne({ mssv });
    if (!account) {
        throw new Error('Invalid mssv');
    }
    // For demonstration purposes, assuming password validation is done before reaching this point
    // const isPasswordValid = await bcrypt.compare(password, Account.password);
    // if (!isPasswordValid) {
    //     throw new Error('Invalid password');
    // }
    if (password !== account.password) {
        throw new Error('Invalid password');
    }
    const expiresIn = 3600; // Thời gian hết hạn của token (đơn vị: giây)
    const accessToken = jsonwebtoken_1.default.sign({ AccountId: account.id, mssv: account.mssv }, JWT_SECRET, { expiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ AccountId: account.id, mssv: account.mssv }, JWT_SECRET);
    return { accessToken, refreshToken, expiresIn };
};
exports.loginAccount = loginAccount;
const refreshAccessToken = async (refreshToken) => {
    const account = await account_model_1.default.findOne({ refreshToken });
    if (!account) {
        throw new Error('Invalid refresh token');
    }
    const accessToken = jsonwebtoken_1.default.sign({ AccountId: account.id, mssv: account.mssv }, JWT_SECRET, { expiresIn: '1h' });
    return accessToken;
};
exports.refreshAccessToken = refreshAccessToken;
