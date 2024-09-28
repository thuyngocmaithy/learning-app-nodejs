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
import puppeteer from 'puppeteer';
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
  private uaScore: string;
  private uaImage: string;

  constructor() {
    this.accountService = new AccountService(AppDataSource);
    this.userService = new UserService(AppDataSource);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.majorRepository = AppDataSource.getRepository(Major);
    this.uaScore = "";
    this.uaImage = "";
  }

  async loginToSgu(username: string, password: string) {
    try {
      // Kiểm tra tài khoản có tồn tại trong cơ sở dữ liệu không
      let account = await this.accountService.getByUsername(username);
      let user = await this.userService.getByUserId(username);

      const loginData = await this.getInfoUserFromSGU(username, password);
      const CURRENT_USER = JSON.parse(loginData.CURRENT_USER || "");
      const CURRENT_USER_INFO = JSON.parse(loginData.CURRENT_USER_INFO || "");

      if (!account) {
        // // Nếu tài khoản không tồn tại, đăng nhập qua SGU
        // const loginData = await this.performSguLogin(username, password);

        // Tạo tài khoản mới trong cơ sở dữ liệu
        account = await this.createOrUpdateAccount(CURRENT_USER, password);

        // Lấy thông tin sinh viên từ SGU
        const imageData = await this.getImageAccount(this.uaImage, CURRENT_USER.access_token, username);

        if (user) {
          // Nếu user đã tồn tại, cập nhật thông tin
          user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, imageData, account);
        } else {
          // Nếu user chưa tồn tại, tạo mới
          user = await this.createNewUser(CURRENT_USER, CURRENT_USER_INFO, imageData, account);
        }

        await this.saveScoresForUserFromSgu(account.username, account.access_token, this.uaScore);

        return this.generateAuthResponse(CURRENT_USER, user as User);
      }
      // else {
      if (account) {
        console.log("tài khoản đã tồn tại\n");
        // Tài khoản đã tồn tại, xóa access_token cũ và cập nhật token mới

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
          throw new Error("Mật khẩu không đúng.");
        } else {
          const tokenConfig = {
            ADMIN: { secret: 'TokenADMIN', role: 'ADMIN' },
            SINHVIEN: { secret: 'TokenSINHVIEN', role: 'SINHVIEN' },
            GIANGVIEN: { secret: 'TokenGIANGVIEN', role: 'GIANGVIEN' }
          };

          type PermissionId = keyof typeof tokenConfig;

          const permissionId = account.permission.permissionId as PermissionId;
          const config = tokenConfig[permissionId];
          if (!config) {
            throw new Error("Invalid permissionId");
          }

          const updatedTokens = {
            access_token: jwt.sign(
              { id: account.id, role: config.role },
              config.secret,
              { expiresIn: '2h' }
            ),
            refresh_token: account.refreshToken,
            roles: config.role
          };

          // else {
          //   // Đăng nhập và lấy token mới từ SGU
          //   account.access_token = ''; // Xóa access_token cũ
          //   account.refreshToken = '';
          //   console.log('token của account :', account.access_token);
          //   console.log("đăng nhập tài khoản mới : \n", account);

          //   updatedTokens = await this.refreshSguTokens(username, password);

          // // Cập nhật access_token và refreshToken
          // account.access_token = updatedTokens.access_token;
          // account.refreshToken = updatedTokens.refresh_token;
          // account.permission.permissionId = updatedTokens.roles;

          // console.log('token của mới account :', account.access_token);
          // }

          await this.saveScoresForUserFromSgu(CURRENT_USER.userName, CURRENT_USER.access_token, this.uaScore);

          // Lưu lại thay đổi
          await this.accountService.update(account.id, account);

          // Lấy thông tin người dùng từ cơ sở dữ liệu và trả về phản hồi
          user = await this.userService.getByUserId(account.username);
          return this.generateAuthResponse(updatedTokens, user as User);
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private async updateExistingUser(user: User, loginData: any, studentInfo: any, imageData: any, account: Account): Promise<User> {
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

  private async createNewUser(loginData: any, studentInfo: any, imageData: any, account: Account): Promise<User> {
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
      user.faculty = { facultyId: studentInfo.khoi.substring(0, 3) } as any;
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

  private generateAuthResponse(loginData: any, user: User) {
    return {
      // status: loginData.code,
      accessToken: loginData.access_token,
      refreshToken: loginData.refresh_token,
      expiresIn: loginData.expires_in,
      user: {
        userId: user.userId,
        fullname: user.fullname,
        avatar: user.avatar,
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

  async getImageAccount(ua: string, access_token: string, ma_sv: string) {
    try {
      const response = await axios.post(`${SGU_IMAGE_ACCOUNT_API_URL}?MaSV=${ma_sv}`, {}, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'ua': ua
        }
      });
      console.log('getImageAccount', response);
      return response.data.data.thong_tin_sinh_vien.image;
    } catch (error) {
      console.error('Error fetching image account:', error);
      throw error;
    }
  }

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

  async saveScoresForUserFromSgu(userId: string, accessToken: string, ua: string) {
    try {
      const sguAuthService = new SguAuthService();
      const jsonResponse = await sguAuthService.getScoreFromSGU(ua, accessToken);

      if (!jsonResponse || !jsonResponse.data || jsonResponse.data.ds_diem_hocky.length === 0) {
        throw new Error('No scores found for the user.');
      }

      const scoreRepository = AppDataSource.getRepository(Score);
      const componentScoreRepository = AppDataSource.getRepository(ComponentScore);
      const subjectRepository = AppDataSource.getRepository(Subject);
      const semesterRepository = AppDataSource.getRepository(Semester);
      const userRepository = AppDataSource.getRepository(User);

      // Loop through each semester in the response
      const semesters = jsonResponse.data.ds_diem_hocky;
      for (const semesterData of semesters) {
        const semesterCode = semesterData.hoc_ky;
        const yearString = semesterCode.substring(0, 4);
        const semesterNumber = parseInt(semesterCode.substring(4));


        // Find or create the semester
        let semester = await semesterRepository.findOne({
          where: {
            semesterName: semesterNumber,
            academicYear: yearString
          }
        });

        if (!semester) {
          semester = new Semester();
          semester.semesterName = semesterNumber;
          semester.academicYear = yearString;
          await semesterRepository.save(semester);
        }

        // Process each subject in the semester
        for (const subjectData of semesterData.ds_diem_mon_hoc) {
          let subject = await subjectRepository.findOne({ where: { subjectId: subjectData.ma_mon } });
          if (!subject) {
            subject = new Subject();
            subject.subjectId = subjectData.ma_mon;
            subject.subjectName = subjectData.ten_mon;
            subject.creditHour = parseInt(subjectData.so_tin_chi);
            subject.isCompulsory = false;
            subject.listFrame = '';
            subject.createDate = new Date();
            subject.lastModifyDate = new Date();

            const userSubject = await userRepository.findOne({ where: { userId: userId } }) as User;
            subject.createUser = userSubject as User;
            subject.lastModifyUser = userSubject as User;

            await subjectRepository.save(subject);
          }

          // Fetch the User entity based on the userId
          const user = await userRepository.findOne({ where: { userId: userId } });
          if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
          }

          // Find the existing Score entry with the correct relationships
          let score = await scoreRepository.findOne({
            where: {
              student: user, // Pass the User entity
              subject: subject, // Pass the Subject entity
              semester: semester // Pass the Semester entity
            }
          });

          if (!score) {
            score = new Score();
            score.student = user;
            score.subject = subject;
            score.semester = semester;
          } else {
            // Delete the existing ComponentScore records
            await componentScoreRepository.delete({ score: score });
            await scoreRepository.delete(score.id);
          }

          // Replace NaN values with 0
          score.examScore = isNaN(parseFloat(subjectData.diem_thi)) ? 0 : parseFloat(subjectData.diem_thi);
          score.testScore = isNaN(parseFloat(subjectData.diem_giua_ky)) ? 0 : parseFloat(subjectData.diem_giua_ky);
          score.finalScore10 = isNaN(parseFloat(subjectData.diem_tk)) ? 0 : parseFloat(subjectData.diem_tk);
          score.finalScore4 = isNaN(parseFloat(subjectData.diem_tk_so)) ? 0 : parseFloat(subjectData.diem_tk_so);
          score.finalScoreLetter = subjectData.diem_tk_chu || '';
          score.result = subjectData.ket_qua === 1;

          await scoreRepository.save(score);

          // Save component scores
          if (subjectData.ds_diem_thanh_phan && subjectData.ds_diem_thanh_phan.length > 0) {
            for (const component of subjectData.ds_diem_thanh_phan) {
              let componentScore = new ComponentScore();
              componentScore.score = score;
              componentScore.componentName = component.ten_thanh_phan;
              componentScore.weight = parseInt(component.trong_so);
              componentScore.weightScore = isNaN(parseFloat(component.diem_thanh_phan)) ? 0 : parseFloat(component.diem_thanh_phan);

              await componentScoreRepository.save(componentScore);
            }
          }
        }
      }

      console.log('User scores successfully saved.');
    } catch (error) {
      console.error('Error saving user scores:', error);
    }
  }


  // async getInfoUserFromSGU(username: string, password: string) {
  //   const browser = await puppeteer.launch({ headless: false });
  //   const page = await browser.newPage();

  //   try {
  //     // Mở trang login của SGU
  //     await page.goto('https://thongtindaotao.sgu.edu.vn/');

  //     // Nhập username và password
  //     await page.type('input#username', username);
  //     await page.type('input#password', password);

  //     // Bấm vào nút đăng nhập
  //     await page.click('button#login-btn');

  //     // Chờ đến khi đăng nhập xong
  //     await page.waitForNavigation();

  //     // Chuyển hướng tới trang xem điểm
  //     await page.goto('https://thongtindaotao.sgu.edu.vn/XemDiem');

  //     // Lấy thông tin điểm
  //     const scores = await page.evaluate(() => {
  //       const scoreTable = document.querySelectorAll('table#scores tbody tr');
  //       const scoreData: any[] = [];
  //       scoreTable.forEach((row) => {
  //         const cols = row.querySelectorAll('td');
  //         scoreData.push({
  //           subject: cols[0].innerText,
  //           score: cols[1].innerText
  //         });
  //       });
  //       return scoreData;
  //     });

  //     await browser.close();
  //     return scores;
  //   } catch (error) {
  //     await browser.close();
  //     throw new Error('Có lỗi xảy ra trong quá trình lấy điểm.');
  //   }
  // };
  async getInfoUserFromSGU(username: string, password: string) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, });
    const pages = await browser.pages(); // Lấy danh sách các tab hiện có
    const page = pages[0] || await browser.newPage(); // Sử dụng tab đầu tiên hoặc tạo mới

    // Bắt các yêu cầu gửi đi từ trang
    page.on('request', request => {
      const url = request.url();
      const headers = request.headers();

      // Kiểm tra xem yêu cầu có phải là API lấy điểm
      if (url.includes('/api/srm/w-locdsdiemsinhvien')) {
        this.uaScore = headers['ua'];

      }

      // Kiểm tra xem yêu cầu có phải là API lấy ảnh
      if (url.includes('/api/sms/w-locthongtinimagesinhvien')) {
        this.uaImage = headers['ua'];
      }
    });

    try {
      // 1. Mở trang login của SGU
      await page.goto('https://thongtindaotao.sgu.edu.vn/', { waitUntil: 'networkidle2' });

      // Hiển thị thông báo "Đang xử lý"
      await page.evaluate(() => {
        const message = document.createElement('div');
        message.textContent = 'Đang xử lý...';
        message.style.position = 'absolute';
        message.style.top = '0'; // Đặt vị trí top là 0
        message.style.left = '0'; // Đặt vị trí left là 0
        message.style.width = '100vw'; // Chiếm toàn bộ chiều rộng
        message.style.height = '100vh'; // Chiếm toàn bộ chiều cao
        message.style.display = 'flex'; // Sử dụng flexbox để căn giữa
        message.style.alignItems = 'center'; // Căn giữa theo chiều dọc
        message.style.justifyContent = 'center'; // Căn giữa theo chiều ngang
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

      // 4. Chờ cho đến khi trang chuyển hướng sau khi đăng nhập thành công
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // 5. Vào trang điểm
      await page.goto('https://thongtindaotao.sgu.edu.vn/#/diem', { waitUntil: 'domcontentloaded' });

      // Chờ xử lý xong api lấy điểm
      await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/srm/w-locdsdiemsinhvien') && response.status() === 200),
        page.goto('https://thongtindaotao.sgu.edu.vn/#/diem', { waitUntil: 'domcontentloaded' }),
      ]);

      // 6. Vào trang thông tin user
      await page.goto('https://thongtindaotao.sgu.edu.vn/#/userinfo', { waitUntil: 'domcontentloaded' });

      // Chờ xử lý xong api lấy ảnh
      await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/sms/w-locthongtinimagesinhvien') && response.status() === 200),
        page.goto('https://thongtindaotao.sgu.edu.vn/#/userinfo', { waitUntil: 'domcontentloaded' }),
      ]);

      // 5. Lấy dữ liệu từ sessionStorage
      const sessionData = await page.evaluate(() => {
        const data: { [key: string]: string | null } = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            data[key] = sessionStorage.getItem(key);
          }
        }
        return data;
      });

      await browser.close();
      return sessionData;
    } catch (error) {
      await browser.close();
      throw new Error(`Lỗi khi lấy dữ liệu sessionStorage: ${error}`);
    }
  }


}