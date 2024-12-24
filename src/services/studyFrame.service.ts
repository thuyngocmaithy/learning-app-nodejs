import { DataSource, In, LessThanOrEqual, Like, MoreThan, Repository } from 'typeorm';
import { StudyFrame, StudyFrame_Component } from '../entities/StudyFrame';
import { User } from '../entities/User';
import { Cycle } from '../entities/Cycle';
import { AppDataSource } from '../data-source';
import { Major } from '../entities/Major';
import { Subject_Course_Opening } from '../entities/Subject_Course_Opening';
import { FrameStructure } from '../entities/FrameStructure';

export class StudyFrameService {
	private studyFrameRepository: Repository<StudyFrame>;
	private userRepository: Repository<User>;
	private cycleRepository: Repository<Cycle>;
	private majorRepository: Repository<Major>;
	private studyFrameComponentRepository: Repository<StudyFrame_Component>;
	private subjectCourseOpeningRepository: Repository<Subject_Course_Opening>;
	private frameStructureRepository: Repository<FrameStructure>;
	private dataSource: DataSource;

	constructor(dataSource: DataSource) {
		this.studyFrameRepository = dataSource.getRepository(StudyFrame);
		this.userRepository = AppDataSource.getRepository(User);
		this.cycleRepository = AppDataSource.getRepository(Cycle);
		this.majorRepository = AppDataSource.getRepository(Major);
		this.subjectCourseOpeningRepository = AppDataSource.getRepository(Subject_Course_Opening);
		this.studyFrameComponentRepository = AppDataSource.getRepository(StudyFrame_Component);
		this.frameStructureRepository = AppDataSource.getRepository(FrameStructure);
		this.dataSource = dataSource;
	}

	async create(data: any): Promise<StudyFrame> {
		// Tìm entity cycle
		const cycle = await this.cycleRepository.findOne({ where: { cycleId: data.cycleId } });
		if (!cycle) {
			throw new Error('SemesterService - create - Not found cycle');
		}

		// Tìm entity major update theo id
		const major = await this.majorRepository.findOne({ where: { majorId: data.majorId } });
		if (!major) {
			throw new Error('SemesterService - create - Not found cycle');
		}

		const dataCreate = {
			frameId: data.frameId,
			frameName: data.frameName,
			cycle: cycle,
			major: major
		}

		const studyFrame = this.studyFrameRepository.create(dataCreate);
		return this.studyFrameRepository.save(studyFrame);
	}

	async getAll(): Promise<StudyFrame[]> {
		return this.studyFrameRepository.find({ relations: ['cycle', 'major'] });
	}

	async getById(id: string): Promise<StudyFrame | null> {
		return this.studyFrameRepository.findOne({
			where: { frameId: id },
			relations: ['major', 'cycle']
		});
	}

	async update(id: string, data: any): Promise<StudyFrame | null> {
		const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: id } });
		if (!studyFrame) {
			return null;
		}
		// Tìm entity cycle
		const cycle = await this.cycleRepository.findOne({ where: { cycleId: data.cycleId } });
		if (!cycle) {
			throw new Error('StudyFrameService - update - Not found cycle');
		}

		// Tìm entity major update theo id
		const major = await this.majorRepository.findOne({ where: { majorId: data.majorId } });
		if (!major) {
			throw new Error('StudyFrameService - update - Not found major');
		}

		const dataUpdate = {
			frameName: data.frameName,
			cycle: cycle,
			major: major
		}

		this.studyFrameRepository.merge(studyFrame, dataUpdate);
		return this.studyFrameRepository.save(studyFrame);
	}

	async checkRelatedData(ids: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.frameStructureRepository, name: 'cấu trúc khung đào tạo' },
			{ repo: this.subjectCourseOpeningRepository, name: 'dữ liệu mở học phần' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { studyFrame: { frameId: In(ids) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Khung đào tạo đang được sử dụng trong ${name}. Không thể xóa.`,
				};
			}
		}

		return { success: true };
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.studyFrameRepository.delete({ frameId: In(ids) });
		return result.affected !== 0;
	}


	// Tìm khung CTĐT theo userId
	async findKhungCTDTByUserId(userId: string): Promise<StudyFrame | null> {
		try {
			const user = await this.userRepository.findOne({
				where: { userId: userId },
				relations: ['major']
			});
			if (!user) {
				throw new Error('Not found entity user');
			}
			// Lấy năm đầu tiên của niên khóa
			const startYear = parseInt(user.nien_khoa.split("-")[0], 10); // Chuyển startYear thành number

			// Tìm chu kỳ của user => Năm đầu tiên của niên khóa lớn hơn hoặc bằng startYear, nhỏ hơn endYear
			const cycle = await this.cycleRepository.findOne({
				where: {
					startYear: LessThanOrEqual(startYear),
					endYear: MoreThan(startYear)
				},
			});
			if (!cycle) {
				throw new Error('Not found entity cycle');
			}

			// Tìm khung đào tạo theo ngành và chu kỳ
			const studyFrame = await this.studyFrameRepository.findOne({
				where: {
					major: { majorId: user.major?.majorId },
					cycle: cycle
				},
				relations: ['cycle']
			})
			return studyFrame;
		} catch (error) {
			throw new Error('Lỗi khi tìm KHUNG CTDT theo userId');
		}
	}

	// Tìm khung CTĐT theo năm và khoa hoặc theo cycle
	async findKhungCTDTDepartment(startYear: number | null, majorId: string, cycleId: string | null): Promise<StudyFrame | null> {
		try {
			let cycle;
			if (cycleId) {
				// Nếu có cycleId => tìm theo cycleId
				cycle = await this.cycleRepository.findOneBy({
					cycleId: cycleId
				});
			}

			if (startYear && majorId) {
				// Tìm chu kỳ của user => Năm đầu tiên của niên khóa lớn hơn hoặc bằng startYear, nhỏ hơn endYear
				cycle = await this.cycleRepository.findOne({
					where: {
						startYear: LessThanOrEqual(startYear),
						endYear: MoreThan(startYear)
					},
				});
			}

			if (!cycle) {
				throw new Error('Not found entity cycle');
			}

			// Tìm khung đào tạo theo ngành và chu kỳ
			const studyFrame = await this.studyFrameRepository.findOne({
				where: {
					major: { majorId: majorId },
					cycle: cycle
				},
			})

			return studyFrame;
		} catch (error) {
			throw new Error('Lỗi khi tìm KHUNG CTDT');
		}
	}

	async callKhungCTDT(studyFrameId: string): Promise<any> {
		try {
			const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: studyFrameId } });
			if (!studyFrame) {
				throw new Error('Lỗi khi tìm KHUNG CTDT');
			}

			const query = 'CALL KhungCTDT(?)';
			const [results] = await this.dataSource.query(
				query,
				[studyFrame?.frameId]
			);

			const resultSet = results[0];

			if (!resultSet || resultSet.length === 0) {
				return [];
			}

			return results;
		} catch (error) {
			console.error('Lỗi khi gọi stored procedure callKhungCTDT', error);
			throw new Error('Lỗi khi gọi stored procedure');
		}
	}

	async getAllComponents(): Promise<StudyFrame_Component[]> {
		return this.studyFrameComponentRepository.find({
			select: [
				'id',
				'frameComponentId',
				'frameComponentName',
				'description',
				'creditHour',
			]
		});
	}

	async getWhere(condition: any): Promise<StudyFrame[]> {
		const whereCondition: any = {};

		if (condition.frameId) {
			whereCondition.frameId = Like(`%${condition.frameId}%`);
		}
		if (condition.frameName) {
			whereCondition.frameName = Like(`%${condition.frameName}%`);
		}

		if (condition.cycle) {
			whereCondition.cycle = { cycleId: condition.cycle };
		}

		if (condition.major) {
			whereCondition.major = { majorId: condition.major };
		}

		return this.studyFrameRepository.find({
			where: whereCondition,
			relations: [
				'major',
				'cycle'
			],
		});
	}

}
