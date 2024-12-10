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
    synchronize: process.env.NODE_ENV !== 'production', // Chỉ bật trong môi trường phát triển
    logging: process.env.NODE_ENV === 'development', // Bật log trong môi trường dev
    entities: [__dirname + '/entities/*{.js,.ts}'],
    migrations: [__dirname + '/migrations/**{.js,.ts}'],
    subscribers: [__dirname + '/subscribers/**{.js,.ts}'],
    connectTimeout: 30000, // 30s timeout
    maxQueryExecutionTime: 5000, // 5s tối đa cho 1 query
    extra: {
        connectionLimit: 100, // Tối đa 10 kết nối đồng thời
        waitForConnections: true,
        queueLimit: 0, // Không giới hạn hàng đợi
    },
});

// Xử lý khởi tạo kết nối với retry
async function initializeDatabase() {
    const maxRetries = 5; // Số lần thử lại tối đa
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await AppDataSource.initialize();
            console.log("Data Source has been initialized!");
            return;
        } catch (err) {
            console.error(`Failed to connect to database (attempt ${retries + 1}/${maxRetries}):`, err);
            retries++;
            if (retries < maxRetries) {
                console.log("Retrying connection in 5 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } else {
                console.error("Could not connect to database after maximum retries");
                process.exit(1);
            }
        }
    }
}

initializeDatabase();

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
