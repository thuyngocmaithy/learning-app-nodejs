// src/index.ts (hoặc file tương tự)
import express, { Request, Response } from 'express';
import { connectDB } from '../src/config/connectDB';
import authRoutes from '../src/routes/authRoutes';

const app = express();

app.use(express.json()); // Để phân tích cú pháp JSON từ body của yêu cầu

// Sử dụng các tuyến đường xác thực
app.get('/', (req: Request, res: Response) => {
    res.send('hello world')
})
app.use('/api/auth', authRoutes);

// Kết nối đến cơ sở dữ liệu
connectDB().then(() => {
    // Khởi chạy ứng dụng sau khi kết nối cơ sở dữ liệu thành công
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
});
