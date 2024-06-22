import express from 'express';
import connectDB from './config/connectDB';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

// Nạp các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
