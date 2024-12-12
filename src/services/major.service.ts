// major.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
import { Major } from '../entities/Major';
import { User } from '../entities/User';
import { Faculty } from '../entities/Faculty';
import { StudyFrame, StudyFrame_Component } from '../entities/StudyFrame';

export class MajorService {
	private majorRepository: Repository<Major>;
	private userRepository: Repository<User>;
	private facultyRepository: Repository<Faculty>
	private studyFrameCompRepository: Repository<StudyFrame_Component>

	constructor(dataSource: DataSource) {
		this.majorRepository = dataSource.getRepository(Major);
		this.userRepository = dataSource.getRepository(User);
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
	}

	async getAll(): Promise<Major[]> {
		return this.majorRepository.find({
			relations: ['faculty'],
		});
	}
	async getById(majorId: string): Promise<Major | null> {
		return this.majorRepository.findOneBy({ majorId });
	}

	async getMaxOrderNoByFaculty(facultyId: string): Promise<number> {
		const result = await this.majorRepository
			.createQueryBuilder('major')
			.leftJoin('major.faculty', 'faculty')
			.where('faculty.facultyId = :facultyId', { facultyId })
			.select('MAX(major.orderNo)', 'maxOrderNo')
			.getRawOne();
		return result.maxOrderNo || 0;
	}


	async create(data: Partial<Major>): Promise<Major> {
		if (!data.faculty?.facultyId) {
			throw new Error('Faculty ID is required');
		}

		const faculty = await this.facultyRepository.findOneBy({
			facultyId: data.faculty.facultyId
		});

		if (!faculty) {
			throw new Error('Faculty not found');
		}

		const maxOrderNo = await this.getMaxOrderNoByFaculty(faculty.facultyId);

		const major = this.majorRepository.create({
			...data,
			faculty: faculty,
			orderNo: maxOrderNo + 1
		});

		return this.majorRepository.save(major);
	}

	async update(majorId: string, data: Partial<Major>): Promise<Major | null> {
		const major = await this.majorRepository.findOneBy({ majorId });
		if (!major) {
			return null;
		}
		this.majorRepository.merge(major, data);
		return this.majorRepository.save(major);
	}

	async checkRelatedData(majorIds: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.studyFrameCompRepository, name: 'dữ liệu khối kiến thức' },
			{ repo: this.userRepository, name: 'dữ liệu người dùng' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			let count = 0;
			try {
				count = await repo.count({ where: { major: { majorId: In(majorIds) } } });
			} catch (error) {
				console.error(error);
			}

			if (count > 0) {
				return {
					success: false,
					message: `Chuyên ngành đang được sử dụng trong ${name}. Không thể xóa.`,
				};
			}
		}
		return { success: true };
	}


	async delete(majorIds: string[]): Promise<boolean> {
		const result = await this.majorRepository.delete({ majorId: In(majorIds) });
		return result.affected !== 0;
	}

	async getWhere(condition: any): Promise<Major[]> {
		const whereCondition: any = {};

		if (condition.userId) {
			const user = await this.userRepository.findOne({
				where: { userId: condition.userId },
				relations: ["faculty"]
			})
			if (!user) {
				throw new Error('Not found entity user');
			}
			whereCondition.faculty = { facultyId: user.faculty.facultyId }
		}

		if (condition.majorId) {
			whereCondition.majorId = Like(`%${condition.majorId}%`);
		}

		if (condition.majorName) {
			whereCondition.majorName = Like(`%${condition.majorName}%`); // Tìm kiếm tương đối
		}

		if (condition.facultyId) {
			whereCondition.faculty = { facultyId: condition.facultyId };
		}

		if (condition.facultyName) {
			whereCondition.faculty = { facultyName: condition.facultyName };
		}

		return this.majorRepository.find({
			where: whereCondition,
			relations: ['faculty']
		});
	}

	async importMajor(data: any[]): Promise<Major[]> {
		let majorSaved = [];
		for (const major of data) {
			// Kiểm tra và chuyển đổi người tạo
			if (major.facultyId) {
				const entity = await this.facultyRepository.findOneBy({ facultyId: major.facultyId });
				if (entity) {
					major.faculty = entity;
				} else {
					major.faculty = null;
				}
			}

			majorSaved.push(await this.create(major));
		}
		return majorSaved;
	}
}