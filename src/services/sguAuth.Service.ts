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
import { Specialization } from '../entities/Specialization';
import { chromium } from 'playwright-core';
import { permission } from 'process';

const SGU_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/auth/login';
const SGU_INFO_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/dkmh/w-locsinhvieninfo';
const SGU_IMAGE_ACCOUNT_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/sms/w-locthongtinimagesinhvien';
const SGU_DIEM_API_URL = 'https://thongtindaotao.sgu.edu.vn/api/srm/w-locdsdiemsinhvien';
// https://thongtindaotao.sgu.edu.vn/api/srm/w-locdsdiemsinhvien?hien_thi_mon_theo_hkdk=false

export class SguAuthService {
	private accountService: AccountService;
	private userService: UserService;
	private permissionRepository: Repository<Permission>;
	private specializationRepository: Repository<Specialization>;
	private scoreRepository: Repository<Score>;
	private componentScoreRepository: Repository<ComponentScore>;
	private subjectRepository: Repository<Subject>;
	private semesterRepository: Repository<Semester>;
	private userRepository: Repository<User>;
	private ScoreOfUser: any;
	private ImageOfUser: string;
	private GPAOfUser: number;
	private CurrentCreditHourOfUser: number;
	constructor() {
		this.scoreRepository = AppDataSource.getRepository(Score);
		this.componentScoreRepository = AppDataSource.getRepository(ComponentScore);
		this.subjectRepository = AppDataSource.getRepository(Subject);
		this.semesterRepository = AppDataSource.getRepository(Semester);
		this.userRepository = AppDataSource.getRepository(User);
		this.accountService = new AccountService(AppDataSource);
		this.userService = new UserService(AppDataSource);
		this.permissionRepository = AppDataSource.getRepository(Permission);
		this.specializationRepository = AppDataSource.getRepository(Specialization);
		this.ScoreOfUser = new Object();
		this.ImageOfUser = "";
		this.GPAOfUser = 0;
		this.CurrentCreditHourOfUser = 0;
	}
	async loginToSgu(username: string, password: string, isSync: boolean) {
		try {
			// Kiểm tra tài khoản có tồn tại trong cơ sở dữ liệu không
			let account = await this.accountService.getByUsername(username);
			let user = await this.userService.getByUserId(username);

			if (account && (account?.isSystem || !isSync)) {
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
			const { CURRENT_USER, CURRENT_USER_INFO } = await this.getInfoUserFromSGU_DKMH(username, password, account ? true : false);

			if (!account) {
				// Tạo account
				account = await this.createOrUpdateAccount(CURRENT_USER, password);
				if (user) {
					// Update user nếu tồn tại
					user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, this.CurrentCreditHourOfUser, account);
				} else {
					// Tạo mới user nếu chưa có
					user = await this.createNewUser(CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, this.CurrentCreditHourOfUser, account);
				}
				if (account.permission.permissionId === "SINHVIEN") {
					// Lưu điểm cho sinh viên
					await this.saveScoresForUserFromSgu(account.username);
				}
			} else {
				// Update account
				account = await this.createOrUpdateAccount(CURRENT_USER, password);
				if (account.permission.permissionId === "SINHVIEN") {
					// Lưu điểm cho sinh viên
					await this.saveScoresForUserFromSgu(CURRENT_USER.userName);
				}
				if (user) {
					// Update user
					user = await this.updateExistingUser(user, CURRENT_USER, CURRENT_USER_INFO, this.ImageOfUser, this.GPAOfUser, this.CurrentCreditHourOfUser, account);
				}
			}

			// Cập nhật refresh token trong database
			account.refreshToken = CURRENT_USER.refresh_token;
			await this.accountService.update(account.id, account);

			// Trả về dạng token với access_token từ sgu
			const tokens = this.generateTokens(account, CURRENT_USER.access_token, CURRENT_USER.expires_in);

			// Lấy thông tin user từ database
			user = await this.userService.getByUserId(account.username);
			return this.generateAuthResponse(tokens, user as User);

		} catch (error) {
			this.handleError(error);
		}
	}

	// NEW TOKEN METHODS
	private generateTokens(account: Account, existingAccessToken?: string, expires_in_SGU?: number) {
		const permissionId = account.permission.permissionId;

		// Nếu đã có access token từ bên ngoài (SGU login API)
		if (existingAccessToken && expires_in_SGU) {
			// Không cần giải mã access token, chỉ cần trả về token đã có
			const refreshTokenExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày tính bằng milliseconds

			const refreshToken = account.refreshToken;

			return {
				accessToken: existingAccessToken,
				refreshToken,
				accessTokenExpiry: expires_in_SGU,
				refreshTokenExpiry: refreshTokenExpiryDate.getTime()
			};
		}

		// Nếu không có access token, tạo mới
		const accessTokenExpiry = '2h';
		const accessTokenExpiryDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 tiếng tính bằng milliseconds

		// Tạo thời gian hết hạn cho refresh token (7 ngày)
		const refreshTokenExpiry = '7d';
		const refreshTokenExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày tính bằng milliseconds

		const accessToken = jwt.sign(
			{
				id: account.id,
				username: account.username,
				role: permissionId
			},
			permissionId,
			{ expiresIn: accessTokenExpiry }
		);

		const refreshToken = jwt.sign(
			{
				id: account.id,
				username: account.username,
				role: permissionId
			},
			permissionId + '_refresh',
			{ expiresIn: refreshTokenExpiry }
		);

		return {
			accessToken,
			refreshToken,
			accessTokenExpiry: accessTokenExpiryDate.getTime(),
			refreshTokenExpiry: refreshTokenExpiryDate.getTime()
		};
	}

	private async refreshToken(accountId: string, refreshToken: string) {
		try {
			// Lấy thông tin account từ refresh token
			const account = await this.accountService.getById(accountId);

			if (!account || account.refreshToken !== refreshToken) {
				throw new Error('Invalid refresh token');
			}

			// Kiểm tra xem account có phải là hệ thống hay SGU
			if (account.isSystem) {
				// Tài khoản hệ thống: tự tạo mới token
				const tokens = this.generateTokens(account);
				account.refreshToken = tokens.refreshToken;
				await this.accountService.update(account.id, account);

				// Lấy thông tin user và trả về response
				const user = await this.userService.getByUserId(account.username);
				return this.generateAuthResponse(tokens, user as User);
			} else {
				// Tài khoản SGU: gọi API để refresh token
				const { access_token, refresh_token, expires_in } = await this.refreshSguTokens(account.refreshToken);

				// Cập nhật access token và refresh token mới vào database
				account.refreshToken = refresh_token;
				await this.accountService.update(account.id, account);

				// Trả về response với token từ SGU
				const tokens = this.generateTokens(account, access_token, expires_in);
				const user = await this.userService.getByUserId(account.username);
				return this.generateAuthResponse(tokens, user as User);
			}
		} catch (error: any) {
			throw new Error('Failed to refresh token: ' + error.message);
		}
	}


	private async refreshSguTokens(refresh_token: string) {
		try {
			const response = await axios.post(SGU_API_URL, {
				refresh_token,
				grant_type: 'refresh_token',
			}, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
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
	private async createNewUser(loginData: any, studentInfo: any, imageData: any, gpaData: number, currentCreditHour: number, account: Account): Promise<User> {
		const studentId = studentInfo.ma_sv;
		let user = await this.userService.getByUserId(studentId);
		const specializationKTPM = await this.specializationRepository.findOneBy({ specializationId: "KTPM" });
		const specializationHTTT = await this.specializationRepository.findOneBy({ specializationId: "HTTT" });
		const specializationKHMT = await this.specializationRepository.findOneBy({ specializationId: "KHMT" });
		const specializationKTMT = await this.specializationRepository.findOneBy({ specializationId: "KTMT" });
		const createUser = await this.userService.getByUserId('admin');

		if (!user) {
			user = new User();
			user.userId = studentId;
			user.createDate = new Date();
			user.fullname = studentInfo.ten_day_du;
			user.dateOfBirth = new Date(studentInfo.ngay_sinh.split('/').reverse().join('-'));
			user.placeOfBirth = studentInfo.noi_sinh;
			user.phone = studentInfo.dien_thoai;
			user.email = studentInfo.email || loginData.principal;
			user.isStudent = user.isStudent;
			user.class = studentInfo.lop;
			user.major = { majorId: studentInfo.khoi?.substring(0, 3) } as any;
			user.firstAcademicYear = parseInt(studentInfo.nhhk_vao.toString().substring(0, 4));
			user.lastAcademicYear = parseInt(studentInfo.nhhk_ra.toString().substring(0, 4));
			user.isActive = true;
			user.avatar = imageData;
			user.account = account;
			user.lastModifyDate = new Date();
			user.nien_khoa = studentInfo.nien_khoa;
			user.sex = studentInfo.gioi_tinh;
			user.cccd = studentInfo.so_cmnd;
			user.khoi = studentInfo.khoi;
			user.bac_he_dao_tao = studentInfo.bac_he_dao_tao;
			user.hoc_vi = studentInfo.hoc_vi;
			user.GPA = gpaData;
			user.currentCreditHour = currentCreditHour;
			if (createUser)
				user.createUser = createUser;
			switch (true) {
				case studentInfo.bo_mon === 'Kỹ thuật phần mềm' || studentInfo.chuyen_nganh === 'Kỹ thuật phần mềm':
					if (specializationKTPM)
						user.specialization = specializationKTPM;
					break;
				case studentInfo.bo_mon === 'Kỹ thuật máy tính' || studentInfo.chuyen_nganh === 'Kỹ thuật máy tính':
					if (specializationKTMT)
						user.specialization = specializationKTMT;
					break;
				case studentInfo.bo_mon === 'Hệ thống thông tin' || studentInfo.chuyen_nganh === 'Hệ thống thông tin':
					if (specializationHTTT)
						user.specialization = specializationHTTT;
					break;
				case studentInfo.bo_mon === 'Khoa học máy tính' || studentInfo.chuyen_nganh === 'Khoa học máy tính':
					if (specializationKHMT)
						user.specialization = specializationKHMT;
					break;
				default:
					break;
			}
		}
		return await this.userService.create(user) as User;
	}
	//update user
	private async updateExistingUser(user: User, loginData: any, studentInfo: any, imageData: any, gpaData: number, currentCreditHour: number, account: Account): Promise<User> {
		user.fullname = studentInfo.ten_day_du;
		user.dateOfBirth = new Date(studentInfo.ngay_sinh?.split('/').reverse().join('-'));
		user.placeOfBirth = studentInfo.noi_sinh;
		user.phone = studentInfo.dien_thoai;
		user.email = studentInfo.email || loginData.principal;
		user.isStudent = user.isStudent;
		user.class = studentInfo.lop;
		user.major = { majorId: studentInfo.khoi?.substring(0, 3) } as any;
		user.firstAcademicYear = parseInt(studentInfo.nhhk_vao?.toString().substring(0, 4)) || 0;
		user.lastAcademicYear = parseInt(studentInfo.nhhk_ra?.toString().substring(0, 4)) || 0;
		user.isActive = true;
		user.avatar = imageData;
		user.account = account;
		user.lastModifyDate = new Date();
		user.nien_khoa = studentInfo.nien_khoa;
		user.sex = studentInfo.gioi_tinh;
		user.cccd = studentInfo.so_cmnd;
		user.khoi = studentInfo.khoi;
		user.bac_he_dao_tao = studentInfo.bac_he_dao_tao;
		user.hoc_vi = studentInfo.hoc_vi;
		user.GPA = gpaData;
		user.currentCreditHour = currentCreditHour;
		switch (true) {
			case studentInfo.bo_mon === 'Kỹ thuật phần mềm' || studentInfo.chuyen_nganh === 'Kỹ thuật phần mềm':
				user.specialization.specializationId = "KTPM";
				break;
			case studentInfo.bo_mon === 'Kỹ thuật máy tính' || studentInfo.chuyen_nganh === 'Kỹ thuật máy tính':
				user.specialization.specializationId = "KTMT";
				break;
			case studentInfo.bo_mon === 'Hệ thống thông tin' || studentInfo.chuyen_nganh === 'Hệ thống thông tin':
				user.specialization.specializationId = "KTPM";
				break;
			case studentInfo.bo_mon === 'Khoa học máy tính' || studentInfo.chuyen_nganh === 'Khoa học máy tính':
				user.specialization.specializationId = "KTPM";
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
				faculty: user.major?.faculty?.facultyId,
				major: user.major?.majorId,
			},
			permission: user.account?.permission?.permissionId
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
			const semesters = this.ScoreOfUser.ds_diem_hocky;
			// Lấy thông tin người dùng một lần
			const user = await this.userRepository.findOne({ where: { userId: userId } });
			if (!user) {
				throw new Error(`Không tìm thấy người dùng với ID ${userId}.`);
			}

			// Xử lý từng học kỳ
			for (const semesterData of semesters) {
				const semesterCode = semesterData.hoc_ky;
				if (semesterCode === '0') {
					continue; // Bỏ qua vòng lặp hiện tại và tiếp tục sang vòng lặp tiếp theo
				}
				const yearString = semesterCode.substring(0, 4);
				const semesterNumber = parseInt(semesterCode.substring(4));

				// Tìm hoặc tạo học kỳ
				let semester = await this.semesterRepository.findOne({
					where: {
						semesterName: semesterNumber,
						academicYear: yearString
					}
				}) || new Semester();

				// Nếu chưa có ID học kỳ, lưu học kỳ mới
				if (!semester.semesterId) {
					semester.semesterId = semesterCode;
					semester.semesterName = semesterNumber;
					semester.academicYear = yearString;
					await this.semesterRepository.save(semester);
				}

				// Xử lý từng môn học trong học kỳ
				for (const subjectData of semesterData.ds_diem_mon_hoc) {
					// Tìm hoặc tạo môn học
					let subject = await this.subjectRepository.findOne({ where: { subjectId: subjectData.ma_mon } }) || new Subject();
					if (!subject.subjectId) {
						subject.subjectId = subjectData.ma_mon;
						subject.subjectName = subjectData.ten_mon;
						subject.creditHour = parseInt(subjectData.so_tin_chi);
						subject.createDate = new Date();
						subject.lastModifyDate = new Date();
						subject.createUser = user; // Gán người tạo
						subject.lastModifyUser = user; // Gán người sửa đổi
						await this.subjectRepository.save(subject);
					}

					// Kiểm tra xem điểm đã tồn tại hay chưa
					let existingScore = await this.scoreRepository.findOne({
						where: {
							student: { userId: userId },
							subject: { subjectId: subject.subjectId },
							semester: { semesterId: semester.semesterId },
						},
					});

					if (!existingScore) {
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
						// Lưu điểm
						await this.scoreRepository.save(score);

						// Xử lý điểm của các thành phần
						if (subjectData.ds_diem_thanh_phan) {
							for (const component of subjectData.ds_diem_thanh_phan) {
								const componentScore = new ComponentScore();
								componentScore.score = score; // Gán điểm cho thành phần
								componentScore.componentName = component.ten_thanh_phan;
								componentScore.weight = parseInt(component.trong_so);
								componentScore.weightScore = isNaN(parseFloat(component.diem_thanh_phan)) ? 0 : parseFloat(component.diem_thanh_phan);
								await this.componentScoreRepository.save(componentScore);
							}
						}
					}
				}
			}
			console.log('Điểm của người dùng đã được lưu thành công.');
		} catch (error) {
			console.error('Lỗi khi lưu điểm của người dùng:', error);
		}
	}

	
	// Lấy dữ liệu từ sessionStorage
	async getSessionData(page: any) {
		return await page.evaluate(() => {
			const data: { [key: string]: string | null } = {};
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key) {
					data[key] = sessionStorage.getItem(key); // Lưu trữ dữ liệu từ sessionStorage
				}
			}
			return data;
		});
	}

	async getInfoUserFromSGU_DKMH(username: string, password: string, isExistAccount: boolean) {
		// Khởi tạo trình duyệt Playwright
		const browser = await chromium.launch({
			headless: true,
			args: [
				'--disable-blink-features=AutomationControlled',
				'--disable-web-security',
				'--allow-running-insecure-content'
			]
		});

		const context = await browser.newContext({
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			bypassCSP: true, // Bypass Content Security Policy
			ignoreHTTPSErrors: true, // Bỏ qua lỗi HTTPS (nếu cần thiết)
			viewport: { width: 1280, height: 720 } // Cấu hình kích thước trình duyệt (tùy chọn)
		});
		const page = await context.newPage();
		// Cấu hình User Agent và Headers
		await page.setExtraHTTPHeaders({
			'Referer': 'https://thongtindaotao.sgu.edu.vn/',
			'Content-Type': 'application/json',
			'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
			'Sec-Ch-Ua-mobile': '?0',
			'Sec-Ch-Ua-platform': '"Windows"',
		});

		// Tắt cache thông qua route
		await page.route('**/*', (route: { request: () => any; continue: (arg0: { headers: any; }) => void; }) => {
			const request = route.request();
			const headers = {
				...request.headers(),
				'Cache-Control': 'no-store', // Ngăn cache
			};
			route.continue({ headers });
		});

		// Khởi tạo lại biến
		this.GPAOfUser = 0;
		this.ImageOfUser = "";
		this.ScoreOfUser = new Object();
		this.CurrentCreditHourOfUser = 0;

		// Bắt các phản hồi (response) từ server
		page.on('response', async (response: any) => {
			const url = response.url();
			// Kiểm tra phản hồi có phải là API lấy điểm không
			if (url.includes('/api/srm/w-locdsdiemsinhvien?hien_thi_mon_theo_hkdk=false')) {
				const scoreData = await response.json(); // Đọc nội dung phản hồi dưới dạng JSON
				this.ScoreOfUser = scoreData.data; // Lưu điểm của người dùng
				this.GPAOfUser = scoreData.data.ds_diem_hocky.find((item: any) => item.loai_nganh).dtb_tich_luy_he_4;

				for (let diem of scoreData.data.ds_diem_hocky) {
					if (diem.so_tin_chi_dat_tich_luy !== "") {
						this.CurrentCreditHourOfUser = diem.so_tin_chi_dat_tich_luy; // set giá trị

						// Tiếp tục điều hướng đến trang user để lấy avatar
						await page.goto('https://thongtindaotao.sgu.edu.vn/public/#/userinfo', { waitUntil: 'networkidle' });

						break; // thoát khỏi vòng lặp
					}
				}
			}
			// Kiểm tra phản hồi có phải là API lấy ảnh không
			if (url.includes('/api/sms/w-locthongtinimagesinhvien')) {
				const imageData = await response.json(); // Đọc nội dung phản hồi dưới dạng JSON        
				this.ImageOfUser = imageData.data.thong_tin_sinh_vien.image; // Lưu ảnh của người dùng
			}
		});

		try {
			// 1. Mở trang đăng nhập của SGU
			await page.goto('https://thongtindaotao.sgu.edu.vn/#/', { waitUntil: 'networkidle' });

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
			await page.fill('input[formcontrolname="username"]', username);
			await page.fill('input[formcontrolname="password"]', password);

			// 3. Bấm nút đăng nhập
			await page.click('button.btn.btn-primary');

			// 4. Đợi thông báo lỗi xuất hiện hoặc điều hướng thành công
			const navigationPromise = page.waitForEvent('domcontentloaded');
			const errorPromise = page.waitForSelector('div.alert.alert-danger', { state: 'visible' });

			const result = await Promise.race([navigationPromise, errorPromise]);

			// Kiểm tra xem thông báo lỗi xuất hiện
			if (result) {
				if (await page.isVisible('div.alert.alert-danger')) {
					const errorMessage = await page.textContent('div.alert.alert-danger');
					if (errorMessage) throw new Error(errorMessage); // Throw lỗi để xử lý tiếp
				}
			}


			// Lấy thông tin CURRENT_USER
			let currentUser: any = null;
			let sessionData = await this.getSessionData(page);
			if (sessionData.CURRENT_USER) {
				try {
					currentUser = JSON.parse(sessionData.CURRENT_USER);
				} catch (error) {
					console.error("Lỗi phân tích cú pháp CURRENT_USER:", error);
				}
			}

			// Gọi hàm để chuyển hướng đến trang điểm và thông tin nếu người dùng là sinh viên
			if (currentUser && typeof currentUser === 'object') {
				if (currentUser.roles === "SINHVIEN") {
					await page.setExtraHTTPHeaders({
						'Referer': 'https://thongtindaotao.sgu.edu.vn/public/',
						'Content-Type': 'application/json',
						'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
						'Sec-Ch-Ua-mobile': '?0',
						'Sec-Ch-Ua-platform': '"Windows"',
						'Authorization': `Bearer ${currentUser.access_token}`,
						'Origin': 'https://thongtindaotao.sgu.edu.vn',
					});
					//6. Vào trang thông tin điểm cho sinh viên
					await page.goto('https://thongtindaotao.sgu.edu.vn/public/#/diem', { waitUntil: 'networkidle' });
				}
				if (currentUser.roles === "GIANGVIEN") {
					// Điều hướng đến trang user để lấy CURRENT_USER_INFO
					await page.goto('https://thongtindaotao.sgu.edu.vn/public/#/userinfo', { waitUntil: 'networkidle' });
				}

			}



			// Lấy lại sessionData sau khi vào trang điểm
			sessionData = await this.getSessionData(page);

			return {
				CURRENT_USER: currentUser,
				CURRENT_USER_INFO: JSON.parse(sessionData.CURRENT_USER_INFO || "")
			};

		} finally {
			await new Promise(resolve => setTimeout(resolve, 500));
			await browser.close();
		}
	}
}