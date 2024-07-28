import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
// import authRouter from './routes/authRoutes';
import { authMiddleware } from './middlewares/auth.middleware';
import { response } from './utils/responseHelper';
import { connectDB } from './config/connectDB'; // Import kết nối TypeORM
import path from 'path';
import authRoutes from './routes/auth.route';

// Nạp các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Kết nối cơ sở dữ liệu với TypeORM
connectDB().then(() => {
    // Chỉ khởi động server sau khi kết nối cơ sở dữ liệu thành công
    app.listen(PORT, () => {
        console.log(`Server đang chạy trên cổng ${PORT}`);
    });
}).catch((error) => {
    console.error('Không thể kết nối cơ sở dữ liệu:', error);
});

app.use(express.static(getPublicDir()));

// Sử dụng router xác thực
// app.use('/api', authRouter);

// Route được bảo vệ để kiểm tra xác thực
app.get('/api/protected', authMiddleware, async (req, res) => {
    await response(res, 200, 'success', { account: req.account }, 'Xác thực thành công!');
});

// Route chính
app.get('/', (req, res) => {
    res.send('Chào mừng đến với API của chúng tôi!');
});

// Sử dụng router auth
app.use('/api/auth', authRoutes);

export default app;

function getPublicDir() {
    return process.env.PUBLIC_DIR || path.resolve(__dirname, "..", "public");
}
