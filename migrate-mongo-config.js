// migrate-mongo-config.js
const path = require('path');
require('ts-node').register(); // Đảm bảo rằng ts-node được đăng ký
const connectDB = require(path.join(__dirname, 'src/config/connectDB')).default;

const config = {
  mongodb: {
    url: '', // URL kết nối của bạn, nếu có thể bỏ qua vì sẽ sử dụng từ connectDB.ts
    databaseName: '', // Tên cơ sở dữ liệu của bạn, nếu có thể bỏ qua vì sẽ sử dụng từ connectDB.ts
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
};

const dbConnection = async () => {
  await connectDB(); // Kết nối tới cơ sở dữ liệu MongoDB
  const db = mongoose.connection.db; // Sử dụng mongoose để lấy instance của cơ sở dữ liệu
  return { db, client: mongoose.connection.getClient() };
};

module.exports = { config, dbConnection };
