import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [__dirname + '/entities/*{.js,.ts}'],
    migrations: [__dirname + '/migrations/**{.js,.ts}'],
    subscribers: [__dirname + '/subscribers/**{.js,.ts}'],
    // Cấu hình connection pool đúng cú pháp cho TypeORM
    connectTimeout: 30000,
    maxQueryExecutionTime: 5000,
    poolSize: 10,
    extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        // Các cấu hình pool được đặt trong extra
        pool: {
            min: 0,
            max: 10,
            idle: 10000,
            acquire: 30000
        }
    }
});

// Xử lý khởi tạo kết nối
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

// Xử lý đóng kết nối khi tắt ứng dụng
process.on('SIGINT', () => {
    AppDataSource.destroy()
        .then(() => {
            console.log('Data Source has been closed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error during Data Source closure:', err);
            process.exit(1);
        });
});