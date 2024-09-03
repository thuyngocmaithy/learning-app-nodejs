import { Repository } from 'typeorm';
import { AccountService } from './account.service';
import { UserService } from './User.service';
import { Account } from '../entities/Account';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import axios, { AxiosError } from 'axios';
import { Permission } from '../entities/Permission';
import jwt from 'jsonwebtoken';

const SGU_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/auth/login';
const SGU_INFO_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/dkmh/w-locsinhvieninfo';
const SGU_IMAGE_ACCOUNT_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/sms/w-locthongtinimagesinhvien';
const SGU_DIEM_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/srm/w-locdsdiemsinhvien';

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
      // Kiểm tra tài khoản có tồn tại trong cơ sở dữ liệu không
      let account = await this.accountService.getByUsername(username);

      console.log(account);

      if (!account) {
        // Nếu tài khoản không tồn tại, đăng nhập qua SGU
        const loginData = await this.performSguLogin(username, password);

        // Tạo tài khoản mới trong cơ sở dữ liệu
        account = await this.createOrUpdateAccount(loginData, password);

        // Lấy thông tin sinh viên từ SGU
        const studentInfo = await this.fetchStudentInfo(loginData.access_token);

        // Tạo hoặc cập nhật người dùng
        const user = await this.createOrUpdateUser(loginData, studentInfo, account);

        return this.generateAuthResponse(loginData, user as User);
      } else { // Tài khoản đã tồn tại, cần cập nhật token    
        let updatedTokens;

        if (account.permission.permissionId === "ADMIN") {
          //nếu tài khoản có quyền ADMIN
          //refreshToken mà không lấy token từ SGU
          updatedTokens = {
            access_token: jwt.sign(
              { id: account.id, role: 'ADMIN' },
              'TokenADMIN',
              { expiresIn: '2h' }
            ),
            refresh_token: account.refreshToken,
            roles: 'ADMIN',
          };
        }
        else {
          updatedTokens = await this.refreshSguTokens(account, username, password);
        }
        account.access_token = updatedTokens.access_token;
        account.refreshToken = updatedTokens.refresh_token;
        account.permission.permissionId == updatedTokens.roles;

        await this.accountService.update(account.id, account);

        // Trả về phản hồi với token mới
        const user = await this.userService.getByUserId(account.username);
        return this.generateAuthResponse(updatedTokens, user as User);
      }
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
    const { userName, principal, access_token, roles } = loginData;
    let account = await this.accountService.getByUsername(userName);

    console.log(loginData);

    if (!account) {
      account = new Account();
      account.username = userName;
      account.email = principal;
      account.password = await bcrypt.hash(password, 10);
      account.access_token = access_token;

      // Thiết lập quyền
      const permisison = await this.permissionRepository.findOne({ where: { permissionId: loginData.roles } });
      if (!permisison) {
        throw new Error('Permission not found');
      }
      account.permission = permisison;
    }

    // Cập nhật tài khoản mới
    if (account.id) {
      return await this.accountService.update(account.id, account) as Account;
    } else {
      return await this.accountService.create(account) as Account;
    }
  }

  private async refreshSguTokens(account: Account, username: string, password: string) {
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
        throw new Error('Lấy token SGU không thành công');
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        roles: data.roles,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Không thể lấy token mới từ SGU. Vui lòng thử lại.');
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
    let user = await this.userService.getByUserId(studentId);

    if (!user) {
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
      user.stillStudy = user.isStudent;
      user.firstAcademicYear = parseInt(studentInfo.nhhk_vao.toString().substring(0, 4));
      user.lastAcademicYear = parseInt(studentInfo.nhhk_ra.toString().substring(0, 4));
      user.isActive = true;
      user.account = account;
      user.lastModifyDate = new Date();
    }

    return await this.userService.create(user) as User;
  }

  private generateAuthResponse(loginData: any, user: User) {
    return {
      status: loginData.code,
      accessToken: loginData.access_token,
      refreshToken: loginData.refresh_token,
      expiresIn: loginData.expires_in,
      user: {
        userId: user.userId,
        username: user.account.username,
        fullname: user.fullname,
        email: user.email,
        roles: loginData.roles
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

  async getImageAccount(access_token: string, ma_sv: string) {
    try {
      const response = await axios.post(`${SGU_IMAGE_ACCOUNT_API_URL}?MaSV=${ma_sv}`, {}, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      // console.error('Error fetching image account:', error);
      // throw error;
    }
  }

  async getScore(access_token: string, ma_sv: string) { //Lấy điểm theo access token
    try {
      const response = await axios.post(`${SGU_DIEM_API_URL}?hien_thi_mon_theo_hkdk=false`, {}, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      // console.error('Error fetching image account:', error);
      // throw error;
    }
  }
}
