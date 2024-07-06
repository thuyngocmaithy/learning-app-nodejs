import express from 'express';
import connectDB from './config/connectDB';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from './routes/authRoutes';
import { authMiddleware } from './middlewares/auth.middlewares';
import { response } from './utils/responseHelper';

// Nạp các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối MongoDB
connectDB();

// Sử dụng router xác thực
app.use('/api', authRouter);

// Route được bảo vệ để kiểm tra xác thực
app.get('/api/protected', authMiddleware, async (req, res) => {
  await response(res, 200, 'success', { account: req.account }, 'Xác thực thành công!');
});

// Route chính
app.get('/', (req, res) => {
  res.send('Chào mừng đến với API của chúng tôi!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

export default app;