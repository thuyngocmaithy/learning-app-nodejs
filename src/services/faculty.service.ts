// faculty.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Faculty } from '../entities/Faculty';
import { Major } from '../entities/Major';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { StudyFrame } from '../entities/StudyFrame';
import { ThesisGroup } from '../entities/ThesisGroup';
import { User } from '../entities/User';

export class FacultyService {
	private facultyRepository: Repository<Faculty>;
	private majorRepository: Repository<Major>;
	private SRGRepository: Repository<ScientificResearchGroup>;
	private studyFrameRepository: Repository<StudyFrame>;
	private thesisGroupRepository: Repository<ThesisGroup>;
	private userRepository: Repository<User>;

	constructor(dataSource: DataSource) {
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.majorRepository = dataSource.getRepository(Major);
		this.SRGRepository = dataSource.getRepository(ScientificResearchGroup);
		this.studyFrameRepository = dataSource.getRepository(StudyFrame);
		this.thesisGroupRepository = dataSource.getRepository(ThesisGroup);
		this.userRepository = dataSource.getRepository(User);
	}

	async create(data: Partial<Faculty>): Promise<Faculty> {
		const faculty = this.facultyRepository.create(data);
		return this.facultyRepository.save(faculty);
	}

	async getAll(): Promise<Faculty[]> {
		return this.facultyRepository.find();
	}

	async getByFacultyId(facultyId: string): Promise<Faculty | null> {
		return this.facultyRepository.findOneBy({ facultyId });
	}

	async update(facultyId: string, data: Partial<Faculty>): Promise<Faculty | null> {
		const faculty = await this.facultyRepository.findOneBy({ facultyId });
		if (!faculty) {
			return null;
		}
		this.facultyRepository.merge(faculty, data);
		return this.facultyRepository.save(faculty);
	}

	// async delete(facultyIds: string[]): Promise<boolean> {
	// 	const result = await this.facultyRepository.delete({ facultyId: In(facultyIds) });
	// 	return result.affected !== 0;
	// }

	async delete(facultyIds: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.majorRepository, name: 'dữ liệu chuyên ngành' },
			{ repo: this.SRGRepository, name: 'dữ liệu nhóm đề tài NCKH' },
			{ repo: this.studyFrameRepository, name: 'dữ liệu khung đào tạo' },
			{ repo: this.thesisGroupRepository, name: 'dữ liệu nhóm đề tài khóa luận' },
			{ repo: this.userRepository, name: 'dữ liệu người dùng' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { faculty: { facultyId: In(facultyIds) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Ngành đang được sử dụng trong ${name}. Không thể xóa.`,
				};
			}
		}

		// Nếu không có liên kết, tiến hành xóa
		const result = await this.facultyRepository.delete({ facultyId: In(facultyIds) });

		if (result.affected === 0) {
			return {
				success: false,
				message: 'Không tìm thấy ngành để xóa.',
			};
		}

		return {
			success: true,
			message: 'Xóa ngành thành công.',
		};
	}

	async getWhere(condition: Partial<Faculty>): Promise<Faculty[]> {
		const queryBuilder = this.facultyRepository.createQueryBuilder('faculty');

		if (condition.facultyId) {
			queryBuilder.andWhere('faculty.facultyId LIKE :facultyId', {
				facultyId: `%${condition.facultyId}%`
			});
		}

		if (condition.facultyName) {
			queryBuilder.andWhere('faculty.facultyName LIKE :facultyName', {
				facultyName: `%${condition.facultyName}%`
			});
		}

		return queryBuilder.getMany();
	}

	async importFaculty(data: Faculty[]): Promise<Faculty[]> {
		let facultySaved = [];
		for (const faculty of data) {
			facultySaved.push(await this.create(faculty));
		}
		return facultySaved;
	}
}