import { sign } from "jsonwebtoken";
import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  // Kiểm tra email có hợp lệ và kết thúc bằng đuôi .edu.vn
  return validator.isEmail(email) && email.toLowerCase().endsWith('.edu.vn');
};

export const validatePassword = (password: string): boolean => {
  // Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

export const validateusername = (username: string): boolean => {
  // username có dạng 312xxxxxxx (tổng 10 số)
  const usernameRegex = /^312\d{7}$/;
  return usernameRegex.test(username);
};

export const validateUser = (email: string, password: string, username: string): boolean => {
  return validateEmail(email) && validatePassword(password) && validateusername(username);
};