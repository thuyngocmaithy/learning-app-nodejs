import axios, { AxiosError } from 'axios';
import { AccountService } from './account.service';
import { UserService } from './User.service';
import { Account } from '../entities/Account';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import { Permission } from '../entities/Permission';
import { Repository } from 'typeorm';

const SGU_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/auth/login';
const SGU_INFO_API_URL = 'https://thongtindaotao.sgu.edu.vn/public/api/dkmh/w-locsinhvieninfo/';

export class SguAuthService {
  private accountService: AccountService;
  private userService: UserService;
  private permissionRepository: Repository<Permission>;
  
  constructor() {
    this.accountService = new AccountService(AppDataSource);
    this.userService = new UserService(AppDataSource);
    this.permissionRepository = AppDataSource.getRepository(Permission);
  }

  async loginToSgu(username: string, password: string) {
    try {
      const loginData = await this.performSguLogin(username, password);
      const account = await this.createOrUpdateAccount(loginData, password);
      const studentInfo = await this.fetchStudentInfo(loginData.access_token);
      const user = await this.createOrUpdateUser(loginData, studentInfo, account);

      return this.generateAuthResponse(loginData, user);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async performSguLogin(username: string, password: string) {
    try {
      const response = await axios.post(SGU_API_URL, {
        username,
        password,
        grant_type: 'password',
      }, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
      });

      const data = response.data;
      if (data.code !== '200') {
        throw new Error('Đăng nhập SGU không thành công');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Đăng nhập SGU thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    }
  }

  private async createOrUpdateAccount(loginData: any, password: string): Promise<Account> {
    const { userName, principal, refresh_token, roles } = loginData;
    let account = await this.accountService.getByUsername(userName);
  
    if (!account) {
      account = new Account();
      account.username = userName;
      account.email = principal;
      
      if (roles === 'SINHVIEN') {
        const studentPermission = await this.permissionRepository.findOne({ where: { permissionId: 'student' } });
        if (!studentPermission) {
          throw new Error('Permission not found');
        }
        account.permission = studentPermission;
      }
    }
  
    account.refreshToken = refresh_token;
    account.password = await bcrypt.hash(password, 10);
    
    if (account.id) {
      return await this.accountService.update(account.id, account) as Account;
    } else {
      return await this.accountService.create(account) as Account;
    }
  }

  private async fetchStudentInfo(accessToken: string) {
    try {
      const response = await axios.post(SGU_INFO_API_URL, {}, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid student info response');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching student info:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error('Không thể lấy thông tin sinh viên. Vui lòng thử lại sau.');
    }
  }

  private async createOrUpdateUser(loginData: any, studentInfo: any, account: Account): Promise<User> {
    const studentId = studentInfo.ma_sv;
    let user = await this.userService.getById(studentId);

    if (user) {
      return user;
    }

    // Update user information
    user = new User();
    user.userId = studentId;
    user.createDate = new Date();
    user.fullname = studentInfo.ten_day_du;
    user.dateOfBirth = new Date(studentInfo.ngay_sinh.split('/').reverse().join('-'));
    user.placeOfBirth = studentInfo.noi_sinh;
    user.phone = studentInfo.dien_thoai;
    user.email = studentInfo.email || loginData.principal;
    user.isStudent = studentInfo.hien_dien_sv === 'Đang học';
    user.class = studentInfo.lop;
    user.faculty = { facultyId: studentInfo.khoi.substring(0, 3) } as any;
    user.major = studentInfo.chuyen_nganh ? { majorId: studentInfo.chuyen_nganh } as any : null;
    user.stillStudy = user.isStudent;
    user.firstAcademicYear = parseInt(studentInfo.nhhk_vao.toString().substring(0, 4));
    user.lastAcademicYear = parseInt(studentInfo.nhhk_ra.toString().substring(0, 4));
    user.isActive = true;
    user.account = account;
    user.lastModifyDate = new Date();

    return await this.userService.create(user) as User;
  }

  private generateAuthResponse(loginData: any, user: User) {
    return {
      status : loginData.code,
      accessToken: loginData.access_token,
      refreshToken: loginData.refresh_token,
      expiresIn: loginData.expires_in,
      user: {
        userId: user.userId,
        username: user.account.username,
        fullname: user.fullname,
        email: user.email,
      },
    };
  }

  private handleError(error: any) {
    console.error('Error in SguAuthService:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
}