import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

// Nạp các biến môi trường từ file .env
dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [__dirname + '/entities/*{.js,.ts}'], // Đường dẫn đến các thực thể
    migrations: [__dirname + '/migrations/**{.js,.ts}'], // Đường dẫn đến các tệp di chuyển
    subscribers: [__dirname + '/subscribers/**{.js,.ts}'], // Đường dẫn đến các tệp phụ
});
