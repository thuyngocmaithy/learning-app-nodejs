
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
		const cycle = await this.cycleRepository.findOneBy({ cycleId: data.cycle });
		if (!cycle) {
			throw new Error('SemesterService - create - Not found cycle');
		}

		const semesterData = {
			semesterId: `${data.academicYear}${data.semesterName}`,
			semesterName: data.semesterName,
			cycle: cycle,
			academicYear: data.academicYear
		}

		const semester = this.semesterRepository.create(semesterData);
		return this.semesterRepository.save(semester);
	}

	async getAll(): Promise<Semester[]> {
		return this.semesterRepository.find({ relations: ['cycle'] });
	}

	async getById(semesterId: string): Promise<Semester | null> {
		return this.semesterRepository.findOne({ where: { semesterId }, relations: ['cycle'] });
	}

	async update(semesterId: string, data: any): Promise<Semester | null> {
		// Tìm entity cycle
		const cycle = await this.cycleRepository.findOneBy({ cycleId: data.cycle });
		if (!cycle) {
			throw new Error('SemesterService - create - Not found cycle');
		}

		// Tìm entity semester update theo id
		const semester = await this.semesterRepository.findOne({ where: { semesterId }, relations: ['cycle'] });
		if (!semester) {
			return null;
		}

		// Tạo semesterData update
		const semesterData = {
			cycle: cycle,
			academicYear: data.academicYear
		}

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

		if (condition.cycle) {
			whereCondition.cycle = { cycleId: condition.cycle };
		}

		if (condition.academicYear) {
			whereCondition.academicYear = condition.academicYear;
		}

		return this.semesterRepository.find({
			where: whereCondition,
			relations: ['cycle'],
		});
	}


}