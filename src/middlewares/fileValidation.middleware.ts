import { Request, Response, NextFunction } from 'express';

export const fileValidation = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    next();
};
