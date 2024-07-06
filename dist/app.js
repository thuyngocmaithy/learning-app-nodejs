"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectDB_1 = __importDefault(require("./config/connectDB"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const auth_middlewares_1 = require("./middlewares/auth.middlewares");
const responseHelper_1 = require("./utils/responseHelper");
// Nạp các biến môi trường từ file .env
dotenv_1.default.config();
// Khởi tạo ứng dụng Express
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Kết nối MongoDB
(0, connectDB_1.default)();
// Sử dụng router xác thực
app.use('/api', authRoutes_1.default);
// Route được bảo vệ để kiểm tra xác thực
app.get('/api/protected', auth_middlewares_1.authMiddleware, async (req, res) => {
    await (0, responseHelper_1.response)(res, 200, 'success', { account: req.account }, 'Xác thực thành công!');
});
// Route chính
app.get('/', (req, res) => {
    res.send('Chào mừng đến với API của chúng tôi!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
exports.default = app;
