// specialization.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
import { Specialization } from '../entities/Specialization';
import { User } from '../entities/User';
import { Major } from '../entities/Major';
import { StudyFrame_Component } from '../entities/StudyFrame';

export class SpecializationService {
	private specializationRepository: Repository<Specialization>;
	private userRepository: Repository<User>;
	private majorRepository: Repository<Major>
	private studyFrameCompRepository: Repository<StudyFrame_Component>

	constructor(dataSource: DataSource) {
		this.specializationRepository = dataSource.getRepository(Specialization);
		this.userRepository = dataSource.getRepository(User);
		this.majorRepository = dataSource.getRepository(Major);
		this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
	}

	async getAll(): Promise<Specialization[]> {
		return this.specializationRepository.find({
			order: { createDate: "DESC", orderNo: "ASC" },
			relations: ['major'],
		});
	}
	async getById(specializationId: string): Promise<Specialization | null> {
		return this.specializationRepository.findOneBy({ specializationId });
	}

	async getMaxOrderNoByMajor(majorId: string): Promise<number> {
		const result = await this.specializationRepository
			.createQueryBuilder('specialization')
			.leftJoin('specialization.major', 'major')
			.where('major.majorId = :majorId', { majorId })
			.select('MAX(specialization.orderNo)', 'maxOrderNo')
			.getRawOne();
		return result.maxOrderNo || 0;
	}


	async create(data: Partial<Specialization>): Promise<Specialization> {
		if (!data.major?.majorId) {
			throw new Error('Major ID is required');
		}

		const major = await this.majorRepository.findOneBy({
			majorId: data.major.majorId
		});

		if (!major) {
			throw new Error('Major not found');
		}

		const maxOrderNo = await this.getMaxOrderNoByMajor(major.majorId);

		const specialization = this.specializationRepository.create({
			...data,
			major: major,
			orderNo: maxOrderNo + 1
		});

		return this.specializationRepository.save(specialization);
	}

	async update(specializationId: string, data: Partial<Specialization>): Promise<Specialization | null> {
		const specialization = await this.specializationRepository.findOneBy({ specializationId });
		if (!specialization) {
			return null;
		}
		this.specializationRepository.merge(specialization, data);
		return this.specializationRepository.save(specialization);
	}

	async checkRelatedData(specializationIds: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.studyFrameCompRepository, name: 'dữ liệu khối kiến thức' },
			{ repo: this.userRepository, name: 'dữ liệu người dùng' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			let count = 0;
			try {
				count = await repo.count({ where: { specialization: { specializationId: In(specializationIds) } } });
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


	async delete(specializationIds: string[]): Promise<boolean> {
		const result = await this.specializationRepository.delete({ specializationId: In(specializationIds) });
		return result.affected !== 0;
	}

	async getWhere(condition: any): Promise<Specialization[]> {
		const whereCondition: any = {};

		if (condition.userId) {
			const user = await this.userRepository.findOne({
				where: { userId: condition.userId },
				relations: ["major"]
			})
			if (!user) {
				throw new Error('Not found entity user');
			}
			whereCondition.major = { majorId: user.major.majorId }
		}

		if (condition.specializationId) {
			whereCondition.specializationId = Like(`%${condition.specializationId}%`);
		}

		if (condition.specializationName) {
			whereCondition.specializationName = Like(`%${condition.specializationName}%`); // Tìm kiếm tương đối
		}

		if (condition.majorId) {
			whereCondition.major = { majorId: condition.majorId };
		}

		if (condition.majorName) {
			whereCondition.major = { majorName: condition.majorName };
		}

		return this.specializationRepository.find({
			where: whereCondition,
			order: { createDate: "DESC", orderNo: "ASC" },
			relations: ['major']
		});
	}

	async importSpecialization(data: any[]): Promise<Specialization[]> {
		let specializationSaved = [];
		for (const specialization of data) {
			// Kiểm tra và chuyển đổi người tạo
			if (specialization.majorId) {
				const entity = await this.majorRepository.findOneBy({ majorId: specialization.majorId });
				if (entity) {
					specialization.major = entity;
				} else {
					specialization.major = null;
				}
			}

			specializationSaved.push(await this.create(specialization));
		}
		return specializationSaved;
	}
}