
// scientificResearchGroup.service.ts
import { ScientificResearch } from './../entities/ScientificResearch';
import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn, In, LessThanOrEqual, MoreThan, MoreThanOrEqual, LessThan, IsNull } from 'typeorm';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';

export class ScientificResearchGroupService {
	private scientificResearchGroupRepository: Repository<ScientificResearchGroup>;
	private facultyRepository: Repository<Faculty>;
	private statusRepository: Repository<Status>;
	private userRepository: Repository<User>;

	constructor(dataSource: DataSource) {
		this.scientificResearchGroupRepository = dataSource.getRepository(ScientificResearchGroup);
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.statusRepository = dataSource.getRepository(Status);
		this.userRepository = dataSource.getRepository(User);
	}

	async getAll(): Promise<ScientificResearchGroup[]> {
		return this.scientificResearchGroupRepository.find(
			{
				order: { createDate: 'DESC' },
				relations: ['status', 'faculty', 'createUser', 'lastModifyUser']
			});
	}

	async getById(scientificResearchGroupId: string): Promise<ScientificResearchGroup | null> {
		return this.scientificResearchGroupRepository.findOne({ where: { scientificResearchGroupId }, relations: ['status', 'faculty', 'createUser', 'lastModifyUser'] });
	}

	public create = async (scientificResearchGroupData: any): Promise<ScientificResearchGroup> => {
		const faculty = await this.facultyRepository.findOne({ where: { facultyId: scientificResearchGroupData.facultyId } });
		if (!faculty) {
			throw new Error('Invalid Faculty ID');
		}

		const status = await this.statusRepository.findOne({ where: { statusId: scientificResearchGroupData.statusId } });
		if (!status) {
			throw new Error('Invalid Status ID');
		}

		const newId = await this.generateNewId(scientificResearchGroupData.facultyId);

		const scientificResearchGroup = this.scientificResearchGroupRepository.create({
			scientificResearchGroupId: newId,
			scientificResearchGroupName: scientificResearchGroupData.scientificResearchGroupName,
			startYear: scientificResearchGroupData.startYear,
			finishYear: scientificResearchGroupData.finishYear,
			faculty: faculty,
			status: status,
			startCreateSRDate: scientificResearchGroupData.startCreateSRDate,
			endCreateSRDate: scientificResearchGroupData.endCreateSRDate,
			createUser: scientificResearchGroupData.createUserId,
			lastModifyUser: scientificResearchGroupData.lastModifyUserId,
		});

		return await this.scientificResearchGroupRepository.save(scientificResearchGroup);
	}

	async update(scientificResearchGroupId: string, data: any): Promise<ScientificResearchGroup | null> {
		const SRGUpdate = await this.scientificResearchGroupRepository.findOneBy({ scientificResearchGroupId });
		if (!SRGUpdate) {
			return null;
		}
		const faculty = await this.facultyRepository.findOne({ where: { facultyId: data.facultyId } });
		if (!faculty) {
			throw new Error('Invalid Faculty ID');
		}

		const status = await this.statusRepository.findOne({ where: { statusId: data.statusId } });
		if (!status) {
			throw new Error('Invalid Status ID');
		}


		// Merge dữ liệu mới vào đối tượng đã tìm thấy
		data.faculty = faculty;
		data.status = status;

		this.scientificResearchGroupRepository.merge(SRGUpdate, data);
		return this.scientificResearchGroupRepository.save(SRGUpdate);
	}

	async updateMulti(scientificResearchGroupId: string[], data: Partial<ScientificResearchGroup>): Promise<ScientificResearchGroup[] | null> {
		// Tìm tất cả các bản ghi với scientificResearchId trong mảng
		const scientificResearchGroupList = await this.scientificResearchGroupRepository.find({
			where: { scientificResearchGroupId: In(scientificResearchGroupId) }
		});

		// Nếu không tìm thấy bản ghi nào
		if (scientificResearchGroupList.length === 0) {
			return null;
		}

		// Cập nhật từng bản ghi
		scientificResearchGroupList.forEach((scientificResearchGroup) => {
			this.scientificResearchGroupRepository.merge(scientificResearchGroup, data);
		});

		// Lưu tất cả các bản ghi đã cập nhật
		return this.scientificResearchGroupRepository.save(scientificResearchGroupList);
	}

	async delete(scientificResearchGroupIds: string[]): Promise<boolean> {
		const result = await this.scientificResearchGroupRepository.delete({ scientificResearchGroupId: In(scientificResearchGroupIds) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}


	private generateNewId = async (facultyId: string): Promise<string> => {
		// Find the last thesis for this faculty
		const lastTScientificResearchGroup = await this.scientificResearchGroupRepository.findOne({
			where: { scientificResearchGroupId: Like(`${facultyId}%`) },
			order: { scientificResearchGroupId: 'DESC' }
		});

		let numericPart = 1;
		if (lastTScientificResearchGroup) {
			const match = lastTScientificResearchGroup.scientificResearchGroupId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
			const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

			numericPart = lastNumericPart + 1;
		}

		// Format the new ID
		return `${facultyId}SRG${numericPart.toString().padStart(3, '0')}`;
	}

	async getWhere(condition: any): Promise<ScientificResearchGroup[]> {
		const queryBuilder = this.scientificResearchGroupRepository.createQueryBuilder('srg');

		// Kiểm tra và thêm điều kiện faculty nếu có
		if (condition.faculty) {
			queryBuilder.andWhere('faculty.facultyId = :facultyId', { facultyId: condition.faculty });
		}

		// Kiểm tra và thêm điều kiện status nếu có
		if (condition.status) {
			queryBuilder.andWhere('status.statusId = :statusId', { statusId: condition.status });
		}

		// Kiểm tra và thêm điều kiện scientificResearchGroupId
		if (condition.scientificResearchGroupId) {
			queryBuilder.andWhere('srg.scientificResearchGroupId LIKE :scientificResearchGroupId', { scientificResearchGroupId: `%${condition.scientificResearchGroupId}%` });
		}

		// Kiểm tra và thêm điều kiện scientificResearchGroupName
		if (condition.scientificResearchGroupName) {
			queryBuilder.andWhere('srg.scientificResearchGroupName LIKE :scientificResearchGroupName', { scientificResearchGroupName: `%${condition.scientificResearchGroupName}%` });
		}

		// Kiểm tra và thêm điều kiện startYear
		if (condition.startYear) {
			queryBuilder.andWhere('srg.startYear LIKE :startYear', { startYear: `%${condition.startYear}%` });
		}

		// Kiểm tra và thêm điều kiện finishYear
		if (condition.finishYear) {
			queryBuilder.andWhere('srg.finishYear LIKE :finishYear', { finishYear: `%${condition.finishYear}%` });
		}

		// Kiểm tra và xử lý condition.stillValue
		if (condition.stillValue) {
			const currentDate = new Date();
			queryBuilder.andWhere(
				'(srg.startCreateSRDate IS NULL OR srg.startCreateSRDate <= :currentDate)',
				{ currentDate }
			);
			queryBuilder.andWhere(
				'(srg.endCreateSRDate IS NULL OR srg.startCreateSRDate > :currentDate)',
				{ currentDate }
			);
		}

		// Kiểm tra và xử lý condition.disabled
		if (condition.disabled) {
			queryBuilder.andWhere(
				'(srg.isDisable <= :disabled)',
				{ disabled: condition.disabled }
			);
		}


		// Thêm mối quan hệ cần lấy
		queryBuilder.leftJoinAndSelect('srg.status', 'status')
			.leftJoinAndSelect('srg.faculty', 'faculty')
			.leftJoinAndSelect('srg.createUser', 'createUser')
			.leftJoinAndSelect('srg.lastModifyUser', 'lastModifyUser');

		queryBuilder.orderBy('srg.createDate', 'DESC');

		// Thực thi truy vấn và trả về kết quả
		const result = await queryBuilder.getMany();
		return result;
	}

	async checkValidDateCreateSR(scientificResearchGroupId: string): Promise<boolean> {
		const queryBuilder = this.scientificResearchGroupRepository.createQueryBuilder('srg');

		// Kiểm tra điều kiện scientificResearchGroupId
		if (scientificResearchGroupId) {
			queryBuilder.andWhere('srg.scientificResearchGroupId LIKE :scientificResearchGroupId', {
				scientificResearchGroupId: scientificResearchGroupId,
			});
		}

		// Điều kiện ngày hợp lệ
		const currentDate = new Date();
		queryBuilder.andWhere(
			'(srg.startCreateSRDate IS NULL OR srg.startCreateSRDate <= :currentDate) AND ' +
			'(srg.endCreateSRDate IS NULL OR srg.endCreateSRDate > :currentDate)',
			{ currentDate }
		);

		// Kiểm tra nếu có bất kỳ bản ghi nào thỏa mãn điều kiện
		const count = await queryBuilder.getCount();
		return count > 0; // Trả về true nếu có ít nhất một bản ghi
	}


	public async importScientificReasearchGroup(data: any[], createUserId: string): Promise<ScientificResearchGroup[]> {
		let scientificResearchGroupSaved = [];
		for (const scientificResearchGroup of data) {
			if (!scientificResearchGroup.scientificResearchGroupName) {
				continue;
			}
			const id = await this.generateNewId(scientificResearchGroup.facultyId);
			scientificResearchGroup.scientificResearchGroupId = id;

			scientificResearchGroup.createUserId = createUserId;
			scientificResearchGroup.lastModifyUserId = createUserId;
			scientificResearchGroupSaved.push(await this.create(scientificResearchGroup));
		}
		return scientificResearchGroupSaved;
	}


}
