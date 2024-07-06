"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.validateMSSV = exports.validatePassword = exports.validateEmail = void 0;
const validator_1 = __importDefault(require("validator"));
const validateEmail = (email) => {
    // Kiểm tra email có hợp lệ và kết thúc bằng đuôi .edu.vn
    return validator_1.default.isEmail(email) && email.toLowerCase().endsWith('.edu.vn');
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    // Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
    return validator_1.default.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    });
};
exports.validatePassword = validatePassword;
const validateMSSV = (mssv) => {
    // MSSV có dạng 312xxxxxxx (tổng 10 số)
    const mssvRegex = /^312\d{7}$/;
    return mssvRegex.test(mssv);
};
exports.validateMSSV = validateMSSV;
const validateUser = (email, password, mssv) => {
    return (0, exports.validateEmail)(email) && (0, exports.validatePassword)(password) && (0, exports.validateMSSV)(mssv);
};
exports.validateUser = validateUser;
