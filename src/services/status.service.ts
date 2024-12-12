// status.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
import { Status } from '../entities/Status';
import { User } from '../entities/User';
import { ScientificResearch } from '../entities/ScientificResearch';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { Thesis } from '../entities/Thesis';
import { ThesisGroup } from '../entities/ThesisGroup';

export class StatusService {
	private statusRepository: Repository<Status>;
	private userRepository: Repository<User>;
	private SRRepository: Repository<ScientificResearch>;
	private SRGRepository: Repository<ScientificResearchGroup>;
	private thesisRepository: Repository<Thesis>;
	private thesisGroupRepository: Repository<ThesisGroup>;

	constructor(dataSource: DataSource) {
		this.statusRepository = dataSource.getRepository(Status);
		this.userRepository = dataSource.getRepository(User);
		this.SRRepository = dataSource.getRepository(ScientificResearch);
		this.SRGRepository = dataSource.getRepository(ScientificResearchGroup);
		this.thesisRepository = dataSource.getRepository(Thesis);
		this.thesisGroupRepository = dataSource.getRepository(ThesisGroup);
	}

	async create(data: Partial<Status>): Promise<Status> {
		const status = this.statusRepository.create(data);
		return this.statusRepository.save(status);
	}

	async getAll(): Promise<Status[]> {
		return this.statusRepository
			.createQueryBuilder("status")
			.orderBy(
				`CASE 
          WHEN status.type = 'Tiến độ nhóm đề tài NCKH' THEN 1
          WHEN status.type = 'Tiến độ đề tài NCKH' THEN 2
          WHEN status.type = 'Tiến độ nhóm đề tài khóa luận' THEN 3          
          WHEN status.type = 'Tiến độ đề tài khóa luận' THEN 4
          ELSE 5
        END`
			)
			.addOrderBy("status.orderNo", "ASC")
			.getMany();
	}

	async getById(statusId: string): Promise<Status | null> {
		return this.statusRepository.findOneBy({ statusId });
	}

	async update(statusId: string, data: Partial<Status>): Promise<Status | null> {
		const status = await this.statusRepository.findOneBy({ statusId });
		if (!status) {
			return null;
		}
		this.statusRepository.merge(status, data);
		return this.statusRepository.save(status);
	}

	async checkRelatedData(statusIds: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.SRRepository, name: 'dữ liệu đề tài NCKH' },
			{ repo: this.SRGRepository, name: 'dữ liệu nhóm đề tài NCKH' },
			{ repo: this.thesisRepository, name: 'dữ liệu đề tài khóa luận' },
			{ repo: this.thesisGroupRepository, name: 'dữ liệu nhóm đề tài khóa luận' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { status: { statusId: In(statusIds) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Trạng thái đang được sử dụng trong ${name}. Không thể xóa.`,
				};
			}
		}

		return { success: true };
	}

	async delete(statusIds: string[]): Promise<boolean> {
		const result = await this.statusRepository.delete({ statusId: In(statusIds) });
		return result.affected !== 0;
	}

	async getByType(type: 'Tiến độ đề tài NCKH' | 'Tiến độ đề tài khóa luận' | 'Tiến độ nhóm đề tài NCKH' | 'Tiến độ nhóm đề tài khóa luận'): Promise<Status[]> {
		return this.statusRepository.find({ where: { type } });
	}

	async getWhere(condition: any): Promise<Status[]> {
		const whereCondition: any = {};
		if (condition.statusId) {
			whereCondition.statusId = condition.statusId;
		}
		if (condition.statusName) {
			whereCondition.statusName = Like(`%${condition.statusName}%`);
		}
		if (condition.type) {
			whereCondition.type = condition.type;
		}
		return this.statusRepository.find({
			where: whereCondition,
		});
	}

	async getMaxOrderNoByType(type: string): Promise<number> {
		const result = await this.statusRepository
			.createQueryBuilder('status')
			.where('status.type = :type', { type })
			.select('MAX(status.orderNo)', 'maxOrderNo')
			.getRawOne();
		return result.maxOrderNo || 0;
	}


	async importStatus(data: any[], createUserId: string): Promise<void> {
		// Kiểm tra createUserId hợp lệ
		const createUser = await this.userRepository.findOne({ where: { userId: createUserId } });
		if (!createUser) {
			throw new Error(`Không tìm thấy người dùng với ID: ${createUserId}`);
		}

		const statusesToSave = await Promise.all(
			data.map(async (statusData) => {
				const statusId = statusData[0];
				const statusName = statusData[1];
				const type = statusData[2];
				const color = statusData[3] || null;

				// Kiểm tra xem trạng thái đã tồn tại chưa
				const existingStatus = await this.statusRepository.findOne({
					where: { statusId },
				});

				if (existingStatus) {
					// Nếu đã tồn tại, cập nhật thông tin trạng thái
					existingStatus.statusName = statusName;
					existingStatus.type = type;
					existingStatus.color = color;
					existingStatus.lastModifyUser = createUser;
					return existingStatus;
				} else {
					// Nếu chưa tồn tại, tạo trạng thái mới
					const status = new Status();
					status.statusId = statusId;
					status.statusName = statusName;
					status.type = type;
					status.color = color;
					status.createUser = createUser;
					status.lastModifyUser = createUser;

					// Tính toán orderNo mới dựa trên type
					const maxOrderNo = await this.getMaxOrderNoByType(status.type);
					status.orderNo = maxOrderNo + 1;

					return status;
				}
			})
		);

		await this.statusRepository.save(statusesToSave);
	}

}
