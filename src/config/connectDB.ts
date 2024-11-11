import { AppDataSource } from '../data-source';

export const connectDB = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Bắt đầu kết nối đến cơ sở dữ liệu...');
      await AppDataSource.initialize();
    }
    console.log('Cơ sở dữ liệu MySQL được kết nối thành công');
  } catch (error) {
    console.error('Không thể kết nối với cơ sở dữ liệu MySQL:', error);
    setTimeout(connectDB, 5000); // Cố gắng kết nối lại sau 5 giây
  }
};



