import { Repository } from 'typeorm';
import { AccountService } from './account.service';
import { UserService } from './User.service';
import { Account } from '../entities/Account';
import { User } from '../entities/User';
import { ComponentScore, Score } from '../entities/Score';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import axios, { AxiosError } from 'axios';
import { Permission } from '../entities/Permission';
import jwt from 'jsonwebtoken';
import { Subject } from '../entities/Subject';
import { Semester } from '../entities/Semester';
import * as puppeteer from 'puppeteer';
import { Major } from '../entities/Major';

const SGU_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/auth/login';
const SGU_INFO_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/dkmh/w-locsinhvieninfo';
const SGU_IMAGE_ACCOUNT_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/sms/w-locthongtinimagesinhvien';
const SGU_DIEM_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/srm/w-locdsdiemsinhvien';
// https://thongtindaotao.sgu.edu.vn/api/srm/w-locdsdiemsinhvien?hien_thi_mon_theo_hkdk=false

export class SguAuthService {
  private accountService: AccountService;
  private userService: UserService;
  private permissionRepository: Repository<Permission>;
  private majorRepository: Repository<Major>;
  private ScoreOfUser: any;
  private ImageOfUser: string;
  private GPAOfUser: number;
  private tokenConfig: { [key: string]: { secret: string; role: string; } };


  constructor() {
    this.accountService = new AccountService(AppDataSource);
    this.userService = new UserService(AppDataSource);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.majorRepository = AppDataSource.getRepository(Major);
    this.ScoreOfUser = new Object();
    this.ImageOfUser = "";
    this.GPAOfUser = 0;
    this.tokenConfig = {
      ADMIN: { 
        secret: process.env.JWT_ADMIN_SECRET || 'TokenADMIN',
        role: 'ADMIN',
      },
      SINHVIEN: { 
        secret: process.env.JWT_STUDENT_SECRET || 'TokenSINHVIEN',
        role: 'SINHVIEN',
      },
      GIANGVIEN: { 
        secret: process.env.JWT_TEACHER_SECRET || 'TokenGIANGVIEN',
        role: 'GIANGVIEN',
      }
    };
  }


  //MAIN ACTION - LOGIN

  // async loginToSgu(username: string, password: string) {
  //   try {
  //     // Kiểm tra tài khoản có tồn tại trong cơ sở dữ liệu không
  //     let account = await this.accountService.getByUsername(username);
  //     let user = await this.userService.getByUserId(username);

  //     if (account?.isSystem) {
  //       // Xử lý đăng nhập cho tài khoản hệ thống
  //       const isPasswordMatch = await bcrypt.compare(password, account.password);
  //       if (!isPasswordMatch) {
  //         throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
  //       }

  //       // Tạo token mới cho tài khoản hệ thống
  //       const updatedAccount = await this.updateAccountTokens(
  //         account, 
  //         account.permission.permissionId
  //       );

  //       return this.generateAuthResponse({
  //         access_token: updatedAccount!.access_token,
  //         refresh_token: updatedAccount!.refreshToken,
  //         roles: account.permission.permissionId
  //       }, user as User);
  //     }

  //     // Xử lý đăng nhập qua SGU
  //     const loginData = await this.getInfoUserFromSGU(username, password, account ? true : false);
  //     const CURRENT_USER = JSON.parse(loginData.CURRENT_USER || "");
  //     const CURRENT_USER_INFO = JSON.parse(loginData.CURRENT_USER_INFO || "");

  //     if (!account) {
  //       // Tạo tài khoản mới
  //       account = await this.createOrUpdateAccount(CURRENT_USER, password);
        
  //       if (user) {
  //         user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, account);
  //       } else {
  //         user = await this.createNewUser(CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, account);
  //       }

  //       if (account.permission.permissionId === "SINHVIEN") {
  //         await this.saveScoresForUserFromSgu(account.username);
  //       }
  //     }

  //     // Cập nhật token cho tài khoản SGU
  //     const updatedAccount = await this.updateAccountTokens(
  //       account,
  //       account.permission.permissionId
  //     );

  //     if (account.permission.permissionId === "SINHVIEN") {
  //       await this.saveScoresForUserFromSgu(CURRENT_USER.userName);
  //     }

  //     // Cập nhật thông tin user nếu cần
  //     if (user) {
  //       user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, account);
  //     }

  //     return this.generateAuthResponse({
  //       access_token: updatedAccount!.access_token,
  //       refresh_token: updatedAccount!.refreshToken,
  //       roles: account.permission.permissionId
  //     }, user as User);

  //   } catch (error) {
  //     this.handleError(error);
  //   }
  // }

  async loginToSgu(username: string, password: string) {
    try {
      // Kiểm tra tài khoản có tồn tại trong cơ sở dữ liệu không
      let account = await this.accountService.getByUsername(username);
      let user = await this.userService.getByUserId(username);

      if (account?.isSystem) {
        // Xử lý đăng nhập cho tài khoản hệ thống
        const isPasswordMatch = await bcrypt.compare(password, account.password);
        if (!isPasswordMatch) {
          throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        // Tạo token mới
        const tokens = this.generateTokens(account);
        
        // Cập nhật refresh token trong database
        account.refreshToken = tokens.refreshToken;
        await this.accountService.update(account.id, account);

        return this.generateAuthResponse(tokens, user as User);
      }

      // Xử lý đăng nhập qua SGU
      const loginData = await this.getInfoUserFromSGU(username, password, account ? true : false);
      const CURRENT_USER = JSON.parse(loginData.CURRENT_USER || "");
      const CURRENT_USER_INFO = JSON.parse(loginData.CURRENT_USER_INFO || "");

      if (!account) {
        account = await this.createOrUpdateAccount(CURRENT_USER, password);
        if (user) {
          user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, account);
        } else {
          user = await this.createNewUser(CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, account);
        }
        if (account.permission.permissionId === "SINHVIEN") {
          await this.saveScoresForUserFromSgu(account.username);
        }
      } else {
        account = await this.createOrUpdateAccount(CURRENT_USER, password);
        if (account.permission.permissionId === "SINHVIEN") {
          await this.saveScoresForUserFromSgu(CURRENT_USER.userName);
        }
        if (user) {
          user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, account);
        }
      }

      // Tạo token mới cho tài khoản
      const tokens = this.generateTokens(account);
      
      // Cập nhật refresh token trong database
      account.refreshToken = tokens.refreshToken;
      await this.accountService.update(account.id, account);

      // Lấy thông tin user từ database
      user = await this.userService.getByUserId(account.username);
      return this.generateAuthResponse(tokens, user as User);

    } catch (error) {
      this.handleError(error);
    }
  }

  // NEW TOKEN METHODS
  private generateTokens(account: Account) {
    type PermissionId = keyof typeof this.tokenConfig;
    const permissionId = account.permission.permissionId as PermissionId;
    const config = this.tokenConfig[permissionId];
    
    if (!config) {
      throw new Error("Invalid permissionId");
    }
  
    // Tạo thời gian hết hạn cho access token (20 phút)
    const accessTokenExpiry = '20m';
    const accessTokenExpiryDate = new Date(Date.now() + 20 * 60 * 1000); // 20 phút tính bằng milliseconds
  
    // Tạo thời gian hết hạn cho refresh token (7 ngày)
    const refreshTokenExpiry = '7d';
    const refreshTokenExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày tính bằng milliseconds
  
    const accessToken = jwt.sign(
      { 
        id: account.id,
        username: account.username,
        role: config.role 
      },
      config.secret,
      { expiresIn: accessTokenExpiry }
    );
  
    const refreshToken = jwt.sign(
      { 
        id: account.id,
        username: account.username,
        role: config.role 
      },
      config.secret + '_refresh',
      { expiresIn: refreshTokenExpiry }
    );
  
    return { 
      accessToken, 
      refreshToken,
      accessTokenExpiry: accessTokenExpiryDate.getTime(),
      refreshTokenExpiry: refreshTokenExpiryDate.getTime()
    };
  }
  
  private async verifyToken(token: string, type: 'access' | 'refresh' = 'access') {
    try {
      // Giải mã token để lấy role
      const decoded = jwt.decode(token) as { role: string };
      if (!decoded || !decoded.role) {
        throw new Error('Invalid token');
      }

      const config = this.tokenConfig[decoded.role as keyof typeof this.tokenConfig];
      if (!config) {
        throw new Error('Invalid role in token');
      }

      // Verify token với secret tương ứng
      const secret = type === 'refresh' ? config.secret + '_refresh' : config.secret;
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  private async updateAccountTokens(account: Account, role: string) {
    const { accessToken, refreshToken } = this.generateTokens(account);
    
    account.access_token = accessToken;
    account.refreshToken = refreshToken;
    
    return await this.accountService.update(account.id, account);
  }
  
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = await this.verifyToken(refreshToken, 'refresh') as any;
      
      // Lấy thông tin account và user
      const account = await this.accountService.getById(decoded.id);
      if (!account || account.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }
  
      // Kiểm tra xem refresh token có hết hạn chưa
      try {
        jwt.verify(refreshToken, this.tokenConfig[account.permission.permissionId].secret + '_refresh');
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          // Nếu refresh token hết hạn, yêu cầu login lại
          throw new Error('Refresh token expired. Please login again.');
        }
        throw error;
      }
  
      // Tạo cặp token mới
      const tokens = this.generateTokens(account);
      
      // Cập nhật refresh token mới vào database
      account.refreshToken = tokens.refreshToken;
      await this.accountService.update(account.id, account);
  
      // Lấy thông tin user để trả về response giống như login
      const user = await this.userService.getByUserId(account.username);
      
      // Trả về response với format giống như login
      return this.generateAuthResponse(tokens, user as User);
  
    } catch (error : any) {
      if (error.message === 'Refresh token expired. Please login again.') {
        throw error;
      }
      throw new Error('Failed to refresh token');
    }
  }





  //BACKUP - OLD METHOD  - NOT USED OR EDIT
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

  private async refreshSguTokens(username: string, password: string) {
    try {
      console.log('Attempting re-login to SGU');
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

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        roles: data.roles,
      };
    } catch (error) {
      console.error('SGU re-login failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
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





  //CREATE OR UPDATE METHOD
  
  //create new user
  private async createNewUser(loginData: any, studentInfo: any, imageData: any, gpaData: number, account: Account): Promise<User> {
    const studentId = studentInfo.ma_sv;
    let user = await this.userService.getByUserId(studentId);
    const majorKTPM = await this.majorRepository.findOneBy({ majorId: "KTPM" });
    const majorHTTT = await this.majorRepository.findOneBy({ majorId: "HTTT" });
    const majorKHMT = await this.majorRepository.findOneBy({ majorId: "KHMT" });
    const majorKTMT = await this.majorRepository.findOneBy({ majorId: "KTMT" });

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
      user.faculty = { facultyId: studentInfo.khoi?.substring(0, 3) } as any;
      user.stillStudy = user.isStudent;
      user.firstAcademicYear = parseInt(studentInfo.nhhk_vao.toString().substring(0, 4));
      user.lastAcademicYear = parseInt(studentInfo.nhhk_ra.toString().substring(0, 4));
      user.isActive = true;
      user.avatar = imageData;
      user.account = account;
      user.lastModifyDate = new Date();
      user.nien_khoa = studentInfo.nien_khoa;
      user.sex = studentInfo.gioi_tinh;
      user.dan_toc = studentInfo.dan_toc;
      user.ton_giao = studentInfo.ton_giao;
      user.quoc_tich = studentInfo.quoc_tich;
      user.cccd = studentInfo.so_cmnd;
      user.ho_khau_thuong_tru = studentInfo.ho_khau_thuong_tru;
      user.khu_vuc = studentInfo.khu_vuc;
      user.khoi = studentInfo.khoi;
      user.bac_he_dao_tao = studentInfo.bac_he_dao_tao;
      user.ma_cvht = studentInfo.ma_cvht;
      user.ho_ten_cvht = studentInfo.ho_ten_cvht;
      user.email_cvht = studentInfo.email_cvht;
      user.dien_thoai_cvht = studentInfo.dien_thoai_cvht;
      user.ma_cvht_ng2 = studentInfo.ma_cvht_ng2;
      user.ho_ten_cvht_ng2 = studentInfo.ho_ten_cvht_ng2;
      user.email_cvht_ng2 = studentInfo.email_cvht_ng2;
      user.dien_thoai_cvht_ng2 = studentInfo.dien_thoai_cvht_ng2;
      user.ma_truong = studentInfo.ma_truong;
      user.ten_truong = studentInfo.ten_truong;
      user.hoc_vi = studentInfo.hoc_vi;
      user.GPA = gpaData;
      switch (true) {
        case studentInfo.bo_mon === 'Kỹ thuật phần mềm' || studentInfo.chuyen_nganh === 'Kỹ thuật phần mềm':
          if (majorKTPM)
            user.major = majorKTPM;
          break;

        case studentInfo.bo_mon === 'Kỹ thuật máy tính' || studentInfo.chuyen_nganh === 'Kỹ thuật máy tính':
          if (majorKTMT)
            user.major = majorKTMT;
          break;

        case studentInfo.bo_mon === 'Hệ thống thông tin' || studentInfo.chuyen_nganh === 'Hệ thống thông tin':
          if (majorHTTT)
            user.major = majorHTTT;
          break;

        case studentInfo.bo_mon === 'Khoa học máy tính' || studentInfo.chuyen_nganh === 'Khoa học máy tính':
          if (majorKHMT)
            user.major = majorKHMT;
          break;

        default:
          break;
      }
    }


    return await this.userService.create(user) as User;
  }

  //update user
  private async updateExistingUser(user: User, loginData: any, studentInfo: any, imageData: any, gpaData: number, account: Account): Promise<User> {

    user.fullname = studentInfo.ten_day_du;
    user.dateOfBirth = new Date(studentInfo.ngay_sinh?.split('/').reverse().join('-'));
    user.placeOfBirth = studentInfo.noi_sinh;
    user.phone = studentInfo.dien_thoai;
    user.email = studentInfo.email || loginData.principal;
    user.isStudent = studentInfo.hien_dien_sv === 'Đang học';
    user.class = studentInfo.lop;
    user.faculty = { facultyId: studentInfo.khoi?.substring(0, 3) } as any;
    user.stillStudy = user.isStudent;
    user.firstAcademicYear = parseInt(studentInfo.nhhk_vao?.toString().substring(0, 4)) || 0;
    user.lastAcademicYear = parseInt(studentInfo.nhhk_ra?.toString().substring(0, 4)) || 0;
    user.isActive = true;
    user.avatar = imageData;
    user.account = account;
    user.lastModifyDate = new Date();
    user.nien_khoa = studentInfo.nien_khoa;
    user.sex = studentInfo.gioi_tinh;
    user.dan_toc = studentInfo.dan_toc;
    user.ton_giao = studentInfo.ton_giao;
    user.quoc_tich = studentInfo.quoc_tich;
    user.cccd = studentInfo.so_cmnd;
    user.ho_khau_thuong_tru = studentInfo.ho_khau_thuong_tru;
    user.khu_vuc = studentInfo.khu_vuc;
    user.khoi = studentInfo.khoi;
    user.bac_he_dao_tao = studentInfo.bac_he_dao_tao;
    user.ma_cvht = studentInfo.ma_cvht;
    user.ho_ten_cvht = studentInfo.ho_ten_cvht;
    user.email_cvht = studentInfo.email_cvht;
    user.dien_thoai_cvht = studentInfo.dien_thoai_cvht;
    user.ma_cvht_ng2 = studentInfo.ma_cvht_ng2;
    user.ho_ten_cvht_ng2 = studentInfo.ho_ten_cvht_ng2;
    user.email_cvht_ng2 = studentInfo.email_cvht_ng2;
    user.dien_thoai_cvht_ng2 = studentInfo.dien_thoai_cvht_ng2;
    user.ma_truong = studentInfo.ma_truong;
    user.ten_truong = studentInfo.ten_truong;
    user.hoc_vi = studentInfo.hoc_vi;
    user.GPA = gpaData;
    switch (true) {
      case studentInfo.bo_mon === 'Kỹ thuật phần mềm' || studentInfo.chuyen_nganh === 'Kỹ thuật phần mềm':
        user.major.majorId = "KTPM";
        break;

      case studentInfo.bo_mon === 'Kỹ thuật máy tính' || studentInfo.chuyen_nganh === 'Kỹ thuật máy tính':
        user.major.majorId = "KTMT";
        break;

      case studentInfo.bo_mon === 'Hệ thống thông tin' || studentInfo.chuyen_nganh === 'Hệ thống thông tin':
        user.major.majorId = "KTPM";
        break;

      case studentInfo.bo_mon === 'Khoa học máy tính' || studentInfo.chuyen_nganh === 'Khoa học máy tính':
        user.major.majorId = "KTPM";
        break;

      default:
        break;
    }


    return await this.userService.update(user.userId, user) as User;
  }

  //creat or update account
  private async createOrUpdateAccount(loginData: any, password: string): Promise<Account> {
    const { userName, principal, access_token, roles } = loginData;
    let account = await this.accountService.getByUsername(userName);

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

  //RESPONSE TO FRONTEND
  private generateAuthResponse(
    tokens: { 
      accessToken: string; 
      refreshToken: string; 
      accessTokenExpiry: number;
      refreshTokenExpiry: number;
    }, 
    user: User
  ) {
    if (!user) {
      throw new Error('User data is required for authentication response');
    }
  
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: {
        accessToken: tokens.accessTokenExpiry,
        refreshToken: tokens.refreshTokenExpiry
      },
      user: {
        userId: user.userId,
        fullname: user.fullname,
        avatar: user.avatar,
        email: user.email,
        roles: user.account?.permission?.permissionId,
        faculty: user.faculty?.facultyId,
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




  //GET FROM SGU
  
  //get image
  async getImageAccount(access_token: string, ma_sv: string) {
    try {
      const response = await axios.post(`${SGU_IMAGE_ACCOUNT_API_URL}?MaSV=${ma_sv}`, {}, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data.data.thong_tin_sinh_vien.image;
    } catch (error) {
      console.error('Error fetching image account:', error);
      throw error;
    }
  }
  
  //get score
  async getScoreFromSGU(ua: string, access_token: string) { //Lấy điểm theo access token
    try {
      const response = await axios.post(`${SGU_DIEM_API_URL}?hien_thi_mon_theo_hkdk=false`, {}, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json; charset=utf-8',
          'ua': ua
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching score :', error);
      throw error;
    }
  }

  //save score
  async saveScoresForUserFromSgu(userId: string) {
    try {
      const scoreRepository = AppDataSource.getRepository(Score);
      const componentScoreRepository = AppDataSource.getRepository(ComponentScore);
      const subjectRepository = AppDataSource.getRepository(Subject);
      const semesterRepository = AppDataSource.getRepository(Semester);
      const userRepository = AppDataSource.getRepository(User);

      const semesters = this.ScoreOfUser.ds_diem_hocky;

      // Lấy thông tin người dùng một lần
      const user = await userRepository.findOne({ where: { userId: userId } });
      if (!user) {
        throw new Error(`Không tìm thấy người dùng với ID ${userId}.`);
      }

      // Xử lý từng học kỳ
      for (const semesterData of semesters) {
        const semesterCode = semesterData.hoc_ky;
        const yearString = semesterCode.substring(0, 4);
        const semesterNumber = parseInt(semesterCode.substring(4));

        // Tìm hoặc tạo học kỳ
        let semester = await semesterRepository.findOne({
          where: {
            semesterName: semesterNumber,
            academicYear: yearString
          }
        }) || new Semester();

        // Nếu chưa có ID học kỳ, lưu học kỳ mới
        if (!semester.semesterId) {
          semester.semesterName = semesterNumber;
          semester.academicYear = yearString;
          await semesterRepository.save(semester);
        }

        // Xử lý từng môn học trong học kỳ
        const subjectPromises = semesterData.ds_diem_mon_hoc.map(async (subjectData: any) => {
          // Tìm hoặc tạo môn học
          let subject = await subjectRepository.findOne({ where: { subjectId: subjectData.ma_mon } }) || new Subject();
          if (!subject.subjectId) {
            subject.subjectId = subjectData.ma_mon;
            subject.subjectName = subjectData.ten_mon;
            subject.creditHour = parseInt(subjectData.so_tin_chi);
            subject.isCompulsory = false;
            subject.frames = [];
            subject.createDate = new Date();
            subject.lastModifyDate = new Date();
            subject.createUser = user; // Gán người tạo
            subject.lastModifyUser = user; // Gán người sửa đổi
            await subjectRepository.save(subject);
          }

          // Chuẩn bị dữ liệu điểm
          const score = new Score();
          score.examScore = isNaN(parseFloat(subjectData.diem_thi)) ? 0 : parseFloat(subjectData.diem_thi);
          score.testScore = isNaN(parseFloat(subjectData.diem_giua_ky)) ? 0 : parseFloat(subjectData.diem_giua_ky);
          score.finalScore10 = isNaN(parseFloat(subjectData.diem_tk)) ? 0 : parseFloat(subjectData.diem_tk);
          score.finalScore4 = isNaN(parseFloat(subjectData.diem_tk_so)) ? 0 : parseFloat(subjectData.diem_tk_so);
          score.finalScoreLetter = subjectData.diem_tk_chu || '';
          score.result = subjectData.ket_qua === 1; // Kiểm tra kết quả
          score.student = user; // Gán sinh viên
          score.subject = subject; // Gán môn học
          score.semester = semester; // Gán học kỳ

          // Lưu hoặc cập nhật điểm
          await scoreRepository.save(score);

          // Xử lý điểm của các thành phần
          if (subjectData.ds_diem_thanh_phan) {
            const componentPromises = subjectData.ds_diem_thanh_phan.map(async (component: any) => {
              const componentScore = new ComponentScore();
              componentScore.score = score; // Gán điểm cho thành phần
              componentScore.componentName = component.ten_thanh_phan;
              componentScore.weight = parseInt(component.trong_so);
              componentScore.weightScore = isNaN(parseFloat(component.diem_thanh_phan)) ? 0 : parseFloat(component.diem_thanh_phan);
              await componentScoreRepository.save(componentScore);
            });
            await Promise.all(componentPromises); // Lưu tất cả điểm thành phần đồng thời
          }
        });

        await Promise.all(subjectPromises); // Lưu tất cả môn học đồng thời
      }

      console.log('Điểm của người dùng đã được lưu thành công.');
    } catch (error) {
      console.error('Lỗi khi lưu điểm của người dùng:', error);
    }
  }

  //get info
  async getInfoUserFromSGU(username: string, password: string, isExistAccount: boolean) {
    // Khởi tạo trình duyệt Puppeteer
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const pages = await browser.pages(); // Lấy danh sách các tab hiện có
    const page = pages[0] || await browser.newPage(); // Sử dụng tab đầu tiên hoặc tạo mới

    // Bắt các phản hồi (response) từ server
    page.on('response', async response => {
      const url = response.url();

      // Kiểm tra phản hồi có phải là API lấy điểm không
      if (url.includes('/api/srm/w-locdsdiemsinhvien')) {
        const scoreData = await response.json(); // Đọc nội dung phản hồi dưới dạng JSON
        this.ScoreOfUser = scoreData.data; // Lưu điểm của người dùng
        this.GPAOfUser = scoreData.data.ds_diem_hocky.find((item: any) => item.loai_nganh).dtb_tich_luy_he_4;
      }

      // Kiểm tra phản hồi có phải là API lấy ảnh không
      if (url.includes('/api/sms/w-locthongtinimagesinhvien')) {
        const imageData = await response.json(); // Đọc nội dung phản hồi dưới dạng JSON
        this.ImageOfUser = imageData.data.thong_tin_sinh_vien.image; // Lưu ảnh của người dùng
      }
    });

    try {
      await page.setCacheEnabled(false);
      // 1. Mở trang đăng nhập của SGU
      await page.goto('https://thongtindaotao.sgu.edu.vn/#/home', { waitUntil: 'networkidle0' });

      // Hiển thị thông báo "Đang xử lý"
      await page.evaluate(() => {
        const message = document.createElement('div');
        message.textContent = 'Đang xử lý...';
        message.style.position = 'absolute';
        message.style.top = '0';
        message.style.left = '0';
        message.style.width = '100vw';
        message.style.height = '100vh';
        message.style.display = 'flex';
        message.style.alignItems = 'center';
        message.style.justifyContent = 'center';
        message.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        message.style.color = 'white';
        message.style.padding = '20px';
        message.style.borderRadius = '5px';
        message.style.pointerEvents = 'none';
        document.body.appendChild(message);
      });

      // 2. Nhập thông tin đăng nhập
      await page.type('input[formcontrolname="username"]', username);
      await page.type('input[formcontrolname="password"]', password);

      // 3. Bấm nút đăng nhập
      await page.click('button.btn.btn-primary.ng-star-inserted');

      // 4. Đợi thông báo lỗi xuất hiện hoặc điều hướng thành công
      const navigationPromise = page.waitForNavigation();
      const errorPromise = page.waitForSelector('div.alert.alert-danger', { visible: true });

      const result = await Promise.race([navigationPromise, errorPromise]);

      // Kiểm tra xem thông báo lỗi xuất hiện
      if (result && result instanceof puppeteer.ElementHandle) {
        const errorMessage = await page.$eval('div.alert.alert-danger', el => el?.textContent?.trim());
        if (errorMessage) {
          throw errorMessage; // Ném ra thông báo lỗi nếu có
        }
      }


      // 5. Lấy dữ liệu từ sessionStorage
      const sessionData = await page.evaluate(() => {
        const data: { [key: string]: string | null } = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            data[key] = sessionStorage.getItem(key); // Lưu trữ dữ liệu từ sessionStorage
          }
        }
        return data;
      });

      // Chức năng điều hướng đến trang điểm
      async function navigateToDiem(retries = 0) {
        await page.goto('https://thongtindaotao.sgu.edu.vn/#/diem', { waitUntil: 'networkidle0' });

        // Kiểm tra phản hồi từ API lấy điểm
        try {
          await Promise.race([
            page.waitForResponse(response => response.url().includes('/api/srm/w-locdsdiemsinhvien') && response.status() === 200),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)) // Thời gian chờ tối đa
          ]);
        } catch (error) {
          if (retries < 3) { // Giới hạn số lần gọi lại
            console.log("Lấy lại điểm, thử lại lần thứ:", retries + 1);
            await navigateToDiem(retries + 1); // Gọi lại nếu có lỗi
          } else {
            throw new Error("Không thể lấy điểm.");
          }
        }
      }

      // Lấy thông tin CURRENT_USER
      let currentUser: any = null; // Sử dụng 'any' để tránh lỗi kiểu
      if (sessionData.CURRENT_USER) {
        try {
          currentUser = JSON.parse(sessionData.CURRENT_USER); // Phân tích cú pháp CURRENT_USER
        } catch (error) {
          console.error("Lỗi phân tích cú pháp CURRENT_USER:", error);
        }
      }

      // Gọi hàm để chuyển hướng đến trang điểm và thông tin nếu người dùng là sinh viên
      if (currentUser && typeof currentUser === 'object' && currentUser.roles === "SINHVIEN") {
        // if (!isExistAccount) {
        // 6. Vào trang thông tin người dùng
        await page.goto('https://thongtindaotao.sgu.edu.vn/#/userinfo', { waitUntil: 'networkidle0' });
        await page.waitForResponse(response => response.url().includes('/api/sms/w-locthongtinimagesinhvien') && response.status() === 200); // Chờ xử lý xong API lấy ảnh
        // }
        // 7. Vào trang điểm
        await navigateToDiem();
      }
      return sessionData;
    } catch (error) {
      throw new Error(`${error}`);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      await browser.close();
    }
  }
}