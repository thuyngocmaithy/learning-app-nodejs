// sguAuth.service.ts
import axios from 'axios';
import { AccountService } from './account.service';
import { UserService } from './User.service';
import { Account } from '../entities/Account';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

const SGU_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/auth/login';

export class SguAuthService {
  private accountService: AccountService;
  private userService: UserService;

  constructor() {
    this.accountService = new AccountService(AppDataSource);
    this.userService = new UserService(AppDataSource);
  }

  async loginToSgu(username: string, password: string) {
    try {
      const response = await axios.post(SGU_API_URL, {
        username,
        password,
        grant_type: 'password',
      });
  
      const data = response.data;
  
      if (data.code !== '200') {
        throw new Error('Đăng nhập SGU không thành công');
      }
  
      const { userName, id, name, principal } = data;
  
      // Kiểm tra xem người dùng đã tồn tại trong DB hay chưa
      let account = await this.accountService.getByUsername(userName);
      if (!account) {
        // Tạo mới Account
        account = new Account();
        account.username = userName;
        account.email = principal;
        account.password = await bcrypt.hash(password, 10); // Mã hóa mật khẩu và lưu lại
        await this.accountService.create(account);
  
        // Tạo mới User
        const user = new User();
        user.userId = id;
        user.fullname = name;
        user.email = principal;
        user.account = account;
        await this.userService.create(user);
      } else {
        // Kiểm tra mật khẩu cục bộ
        const passwordMatch = await bcrypt.compare(password, account.password);
        if (!passwordMatch) {
          throw new Error('Mật khẩu không chính xác');
        }
  
        // Cập nhật thông tin người dùng nếu cần
        const user = await this.userService.getById(id);
        if (user) {
          user.fullname = name;
          user.email = principal;
          await this.userService.update(user.id, user);
        }
      }
  
      // Trả về token và thông tin user
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        user: {
          userId: id,
          username: userName,
          fullname: name,
          email: principal,
        },
      };
    } catch (error) {
      throw error;
    }
  }
  
}
