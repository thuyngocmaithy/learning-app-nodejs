import { Request, Response } from 'express';
import upload from '../services/upload.service';

// Middleware upload file
export const uploadFile = upload.single('image');

// Handler cho việc upload file
export const handleUpload = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({
        message: 'File uploaded successfully.',
        file: req.file
    });
};
