import { AppDataSource } from '../data-source';

let retryCount = 0;
const MAX_RETRIES = 5; // Giới hạn số lần thử lại

export const connectDB = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Bắt đầu kết nối đến cơ sở dữ liệu...');
      await AppDataSource.initialize();
    }
    console.log('Cơ sở dữ liệu MySQL được kết nối thành công');
  } catch (error) {
    retryCount++;
    console.error('Không thể kết nối với cơ sở dữ liệu MySQL:', error);

    // Kiểm tra số lần thử lại
    if (retryCount <= MAX_RETRIES) {
      console.log(`Thử lại kết nối lần ${retryCount} sau 5 giây...`);
      setTimeout(connectDB, 5000); // Cố gắng kết nối lại sau 5 giây
    } else {
      console.error('Không thể kết nối sau nhiều lần thử, dừng lại.');
      // Có thể gửi thông báo lỗi qua email hoặc hệ thống giám sát
    }
  }
};
