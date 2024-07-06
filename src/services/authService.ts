import Account, { IAccount } from '../models/account.model';
import { validateEmail, validatePassword, validateMSSV } from '../utils/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerAccount = async (email: string, password: string, mssv: string): Promise<IAccount> => {
    if (!validateEmail(email)) {
        throw new Error('Invalid email format');
    }
    
    if (!validatePassword(password)) {
        throw new Error('Invalid password format');
    }
    
    if (!validateMSSV(mssv)) {
        throw new Error('Invalid MSSV format');
    }

    const existingAccount = await Account.findOne({ $or: [{ email }, { mssv }] });
    if (existingAccount) {
        throw new Error('Account with this email or MSSV already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = new Account({
        email,
        password: hashedPassword,
        mssv
    });

    await newAccount.save();

    return newAccount;
};

export const loginAccount = async (mssv: string, password: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> => {
    const account = await Account.findOne({ mssv });

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

    const accessToken = jwt.sign(
        { AccountId: account.id, mssv: account.mssv },
        JWT_SECRET,
        { expiresIn }
    );

    const refreshToken = jwt.sign(
        { AccountId: account.id, mssv: account.mssv },
        JWT_SECRET
    );

    return { accessToken, refreshToken, expiresIn };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    const account = await Account.findOne({ refreshToken });

    if (!account) {
        throw new Error('Invalid refresh token');
    }

    const accessToken = jwt.sign(
        { AccountId: account.id, mssv: account.mssv },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return accessToken;
};
