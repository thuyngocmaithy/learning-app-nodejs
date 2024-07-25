// src/config/connectDB.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import Account from '../models/account.model';

// Nạp các biến môi trường từ file .env
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    dialect: 'mysql',
    logging: false // Đặt thành true nếu muốn xem các câu lệnh SQL trong console
  }
);

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Cơ sở dữ liệu MySQL được kết nối thành công');

    // Đồng bộ các mô hình với cơ sở dữ liệu
    await sequelize.sync({ alter: true }); // Thay đổi bảng nếu cần thiết

    console.log('Cơ sở dữ liệu được đồng bộ hóa');
  } catch (error) {
    console.error('Không thể kết nối với cơ sở dữ liệu MySQL:', error);
    process.exit(1);
  }
};

export { sequelize };
