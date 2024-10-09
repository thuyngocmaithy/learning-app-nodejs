import { AppDataSource } from './data-source';
import fs from 'fs';
import path from 'path';

async function runSeeds() {
    // Khởi tạo kết nối đến cơ sở dữ liệu nếu chưa được khởi tạo
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    // Đường dẫn tới thư mục seeds
    const seedsDir = path.join(__dirname, 'seeds');

    // Đọc danh sách file trong thư mục seeds
    const seedFiles = fs.readdirSync(seedsDir).filter(file =>
        file.endsWith('.ts') || file.endsWith('.js')
    );

    console.log('Seed files found:', seedFiles); // In ra để kiểm tra

    for (const file of seedFiles) {
        const seedModule = await import(path.join(seedsDir, file)); // Nhập từng file seed
        if (seedModule.default) {
            await seedModule.default(); // Gọi hàm mặc định trong từng file seed
        }
    }

    await AppDataSource.destroy(); // Đóng kết nối
}

runSeeds().catch(console.error);
