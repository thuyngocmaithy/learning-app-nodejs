import multer from 'multer';
import path from 'path';

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads')); // Thư mục lưu trữ ảnh
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Đổi tên file để tránh trùng lặp
    }
});

// Khởi tạo multer với cấu hình lưu trữ
const upload = multer({ storage });

export default upload;
