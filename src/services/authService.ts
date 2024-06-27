import User, { IUser } from '../models/user.model';
import { validateEmail, validatePassword, validateMSSV } from '../utils/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerUser = async (email: string, password: string, mssv: string): Promise<IUser> => {
    if (!validateEmail(email)) {
        throw new Error('Invalid email format');
    }
    
    if (!validatePassword(password)) {
        throw new Error('Invalid password format');
    }
    
    if (!validateMSSV(mssv)) {
        throw new Error('Invalid MSSV format');
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mssv }] });
    if (existingUser) {
        throw new Error('User with this email or MSSV already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email,
        password: hashedPassword,
        mssv
    });

    await newUser.save();

    return newUser;
};

export const loginUser = async (mssv: string, password: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> => {
    const user = await User.findOne({ mssv });

    if (!user) {
        throw new Error('Invalid mssv');
    }

    // For demonstration purposes, assuming password validation is done before reaching this point
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //     throw new Error('Invalid password');
    // }

    if (password !== user.password) {
        throw new Error('Invalid password');
    }

    const expiresIn = 3600; // Thời gian hết hạn của token (đơn vị: giây)

    const accessToken = jwt.sign(
        { userId: user.id, mssv: user.mssv },
        JWT_SECRET,
        { expiresIn }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, mssv: user.mssv },
        JWT_SECRET
    );

    return { accessToken, refreshToken, expiresIn };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    const user = await User.findOne({ refreshToken });

    if (!user) {
        throw new Error('Invalid refresh token');
    }

    const accessToken = jwt.sign(
        { userId: user.id, mssv: user.mssv },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return accessToken;
};
