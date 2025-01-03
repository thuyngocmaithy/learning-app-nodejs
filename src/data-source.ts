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
    connectTimeout: 30000, // 30s timeout
    maxQueryExecutionTime: 5000, // 5s tối đa cho 1 query
    poolSize: 10,
    extra: {
        connectionLimit: 100,
        waitForConnections: true,
        queueLimit: 0,
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

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
