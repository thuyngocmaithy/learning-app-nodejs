
import { DataSource, In, Repository } from 'typeorm';
import { Semester } from '../entities/Semester';
import { Cycle } from '../entities/Cycle';
import { Subject_Course_Opening } from '../entities/Subject_Course_Opening';
import { UserRegisterSubject } from '../entities/User_Register_Subject';
import { Score } from '../entities/Score';

export class SemesterService {
	private semesterRepository: Repository<Semester>;
	private cycleRepository: Repository<Cycle>;
	private subjectCourseOpeningRepository: Repository<Subject_Course_Opening>;
	private userRegisterSubjectRepository: Repository<UserRegisterSubject>;
	private scoreRepository: Repository<Score>;

	constructor(dataSource: DataSource) {
		this.semesterRepository = dataSource.getRepository(Semester);
		this.cycleRepository = dataSource.getRepository(Cycle);
		this.subjectCourseOpeningRepository = dataSource.getRepository(Subject_Course_Opening);
		this.userRegisterSubjectRepository = dataSource.getRepository(UserRegisterSubject);
		this.scoreRepository = dataSource.getRepository(Score);
	}

	async create(data: any): Promise<Semester> {
		// Tìm các chu kỳ theo mảng cycleId
		const cycles = await this.cycleRepository.findBy({
			cycleId: In(data.cycle), // `data.cycle` là một mảng các cycleId
		});

		if (cycles.length === 0) {
			throw new Error('SemesterService - create - No valid cycles found');
		}

		// Tạo dữ liệu học kỳ
		const semesterData = {
			semesterId: `${data.academicYear}${data.semesterName}`,
			semesterName: data.semesterName,
			academicYear: data.academicYear,
			cycles: cycles, // Gán mảng các chu kỳ tìm được
		};

		// Tạo và lưu học kỳ mới
		const semester = this.semesterRepository.create(semesterData);
		return this.semesterRepository.save(semester);
	}


	async getAll(): Promise<Semester[]> {
		return this.semesterRepository.find({ relations: ['cycles'] });
	}

	async getById(semesterId: string): Promise<Semester | null> {
		return this.semesterRepository.findOne({ where: { semesterId }, relations: ['cycles'] });
	}

	async update(semesterId: string, data: any): Promise<Semester | null> {
		// Tìm các chu kỳ theo mảng cycleId
		const cycles = await this.cycleRepository.findBy({
			cycleId: In(data.cycle),
		});

		if (cycles.length === 0) {
			throw new Error('SemesterService - update - No valid cycles found');
		}

		// Tìm học kỳ cần cập nhật
		const semester = await this.semesterRepository.findOne({ where: { semesterId }, relations: ['cycles'] });
		if (!semester) {
			return null;
		}

		// Gán dữ liệu mới vào học kỳ
		const semesterData = {
			academicYear: data.academicYear,
			cycles: cycles, // Gán lại các cycles
		};

		this.semesterRepository.merge(semester, semesterData);
		return this.semesterRepository.save(semester);
	}


	async checkRelatedData(ids: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.scoreRepository, name: 'dữ liệu điểm' },
			{ repo: this.subjectCourseOpeningRepository, name: 'dữ liệu mở học phần' },
			{ repo: this.userRegisterSubjectRepository, name: 'dữ liệu đăng ký học của sinh viên' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { semester: { semesterId: In(ids) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Học kỳ đang được sử dụng trong ${name}. Không thể xóa.`,
				};
			}
		}
		return { success: true };
	}


	async delete(ids: string[]): Promise<boolean> {
		const result = await this.semesterRepository.delete({ semesterId: In(ids) });
		return result.affected !== 0;
	}


	async getWhere(condition: Partial<Semester>): Promise<Semester[]> {
		const whereCondition: any = {};

		if (condition.cycles && condition.cycles.length > 0) {
			whereCondition.cycles = { cycleId: condition.cycles[0].cycleId };
		}

		if (condition.academicYear) {
			whereCondition.academicYear = condition.academicYear;
		}

		return this.semesterRepository.find({
			where: whereCondition,
			relations: ['cycles'], // Đổi từ 'cycle' sang 'cycles'
			order: { semesterId: "ASC" }
		});
	}



}