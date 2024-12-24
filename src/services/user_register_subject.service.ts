import { DataSource, Repository } from 'typeorm';
import { UserRegisterSubject } from '../entities/User_Register_Subject';
import { User } from '../entities/User';
import { Subject } from '../entities/Subject';
import { Semester } from '../entities/Semester';

export class UserRegisterSubjectService {
	private userRegisterSubjectRepository: Repository<UserRegisterSubject>;
	private userRepository: Repository<User>;
	private subjectRepository: Repository<Subject>;
	private semesterRepository: Repository<Semester>;

	constructor(dataSource: DataSource) {
		this.userRegisterSubjectRepository = dataSource.getRepository(UserRegisterSubject);
		this.userRepository = dataSource.getRepository(User);
		this.subjectRepository = dataSource.getRepository(Subject);
		this.semesterRepository = dataSource.getRepository(Semester);
	}

	async registerSubject(userId: string, subjectId: string, semesterId: string): Promise<{ success: boolean, message: string }> {
		try {
			const user = await this.userRepository.findOne({ where: { userId } });
			if (!user) {
				return { success: false, message: `User with ID ${userId} not found` };
			}

			const subject = await this.subjectRepository.findOne({ where: { subjectId } });
			if (!subject) {
				return { success: false, message: `Subject with ID ${subjectId} not found` };
			}

			const semester = await this.semesterRepository.findOne({ where: { semesterId } });
			if (!semester) {
				return { success: false, message: `Semester with ID ${semesterId} not found` };
			}

			// Check if the user has already registered for this subject in this semester
			const existingRegistration = await this.userRegisterSubjectRepository.findOne({
				where: {
					user: { userId },
					subject: { subjectId },
					semester: { semesterId },
				},
			});

			if (existingRegistration) {
				return { success: true, message: `User has already registered for subject ${subjectId} in semester ${semesterId}` };
			}

			const userRegisterSubject = this.userRegisterSubjectRepository.create({
				user,
				subject,
				semester,
			});

			await this.userRegisterSubjectRepository.save(userRegisterSubject);
			return { success: true, message: `Successfully registered subject ${subjectId} for user ${userId} in semester ${semesterId}` };
		} catch (error) {
			console.error('Error in registerSubject:', error);
			return { success: false, message: 'An error occurred while registering the subject' };
		}
	}

	async getUserRegisteredSubjects(userId: string): Promise<UserRegisterSubject[]> {
		return this.userRegisterSubjectRepository.find({
			where: { user: { userId } },
			relations: ['subject', 'semester'],
		});
	}

	async deleteRegistration(userId: string, subjectId: string, semesterId: string): Promise<{ success: boolean, message: string }> {
		try {
			// Find the existing registration
			const registration = await this.userRegisterSubjectRepository.findOne({
				where: {
					user: { userId },
					subject: { subjectId },
					semester: { semesterId },
				},
			});

			if (!registration) {
				return { success: false, message: `Registration not found for user ${userId}, subject ${subjectId}, and semester ${semesterId}` };
			}

			// Delete the registration
			await this.userRegisterSubjectRepository.remove(registration);
			return { success: true, message: `Successfully deleted registration for subject ${subjectId} for user ${userId} in semester ${semesterId}` };
		} catch (error) {
			console.error('Error in deleteRegistration:', error);
			return { success: false, message: 'An error occurred while deleting the registration' };
		}
	}


	async saveRegister(data: any): Promise<{ success: boolean, message: string }> {
		try {
			// Tìm user theo userId
			const user = await this.userRepository.findOne({
				where: { userId: data.user }
			});

			if (!user) {
				return { success: false, message: `User with ID ${data.user} not found` };
			}

			// Tìm môn học theo subjectId
			const subject = await this.subjectRepository.findOne({ where: { subjectId: data.subject } });
			if (!subject) {
				return { success: false, message: `Subject with ID ${data.subject} not found` };
			}

			// Tìm học kỳ theo semesterId
			const semester = await this.semesterRepository.findOne({ where: { semesterId: data.semester } });
			if (!semester) {
				return { success: false, message: `Semester with ID ${data.semester} not found` };
			}

			// Tìm danh sách bản ghi đăng ký môn học của user
			const existingRegistrations = await this.userRegisterSubjectRepository.find({
				where: { user: { userId: data.user }, subject: { subjectId: data.subject } },
				relations: ['subject', 'semester'],
			});

			// Kiểm tra xem bản ghi đã tồn tại hay chưa
			const existingRegistration = existingRegistrations.find(
				reg => reg.subject.subjectId === data.subject && reg.semester.semesterId === data.semester
			);

			if (existingRegistration) {
				// Nếu đã tồn tại, kiểm tra xem có cần cập nhật không
				if (existingRegistration.semester.semesterId !== data.semester) {
					existingRegistration.semester = semester;
					await this.userRegisterSubjectRepository.save(existingRegistration);
				}
			} else {
				// Thêm mới nếu không tìm thấy
				const userRegisterSubject = this.userRegisterSubjectRepository.create({
					user,
					subject,
					semester,
				});
				await this.userRegisterSubjectRepository.save(userRegisterSubject);
			}

			// Xóa các bản ghi không còn cần thiết (user và subject đã tồn tại nhưng không cùng semester)
			for (const reg of existingRegistrations) {
				if (reg.semester.semesterId !== data.semester) {
					await this.userRegisterSubjectRepository.remove(reg);
				}
			}

			return { success: true, message: `Successfully registered subject` };
		} catch (error) {
			console.error('Error in registerSubject:', error);
			return { success: false, message: 'An error occurred while registering the subject' };
		}
	}


}