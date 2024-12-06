import { DataSource, Repository, Like, In } from 'typeorm';
import { ThesisGroup } from '../entities/ThesisGroup';
import { Faculty } from '../entities/Faculty';
import { Status } from '../entities/Status';
import { User } from '../entities/User';

export class ThesisGroupService {
	private thesisGroupRepository: Repository<ThesisGroup>;
	private facultyRepository: Repository<Faculty>;
	private statusRepository: Repository<Status>;

	constructor(dataSource: DataSource) {
		this.thesisGroupRepository = dataSource.getRepository(ThesisGroup);
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.statusRepository = dataSource.getRepository(Status);
	}

	async getAll(): Promise<ThesisGroup[]> {
		return this.thesisGroupRepository.find({
			order: { createDate: 'DESC' },
			relations: ['status', 'faculty', 'createUser', 'lastModifyUser']
		});
	}

	async getById(thesisGroupId: string): Promise<ThesisGroup | null> {
		return this.thesisGroupRepository.findOne({ where: { thesisGroupId }, relations: ['status', 'faculty', 'createUser', 'lastModifyUser'] });
	}

	public create = async (thesisGroupData: any): Promise<ThesisGroup> => {
		const faculty = await this.facultyRepository.findOne({ where: { facultyId: thesisGroupData.facultyId } });
		if (!faculty) {
			throw new Error('Invalid Faculty ID');
		}

		const status = await this.statusRepository.findOne({ where: { statusId: thesisGroupData.statusId } });
		if (!status) {
			throw new Error('Invalid Status ID');
		}

		const newId = await this.generateNewId(thesisGroupData.facultyId);

		const thesisGroup = this.thesisGroupRepository.create({
			thesisGroupId: newId,
			thesisGroupName: thesisGroupData.thesisGroupName,
			startYear: thesisGroupData.startYear,
			finishYear: thesisGroupData.finishYear,
			faculty: faculty,
			status: status,
			startCreateThesisDate: thesisGroupData.startCreateThesisDate,
			endCreateThesisDate: thesisGroupData.endCreateThesisDate,
			createUser: thesisGroupData.createUserId,
			lastModifyUser: thesisGroupData.lastModifyUserId,
		});

		return await this.thesisGroupRepository.save(thesisGroup);
	}

	async update(thesisGroupId: string, data: any): Promise<ThesisGroup | null> {
		const ThesisGUpdate = await this.thesisGroupRepository.findOneBy({ thesisGroupId });
		if (!ThesisGUpdate) {
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

		this.thesisGroupRepository.merge(ThesisGUpdate, data);
		return this.thesisGroupRepository.save(ThesisGUpdate);
	}

	async updateMulti(thesisGroupId: string[], data: Partial<ThesisGroup>): Promise<ThesisGroup[] | null> {
		// Tìm tất cả các bản ghi với thesisId trong mảng
		const thesisGroupList = await this.thesisGroupRepository.find({
			where: { thesisGroupId: In(thesisGroupId) }
		});

		// Nếu không tìm thấy bản ghi nào
		if (thesisGroupList.length === 0) {
			return null;
		}

		// Cập nhật từng bản ghi
		thesisGroupList.forEach((thesisGroup) => {
			this.thesisGroupRepository.merge(thesisGroup, data);
		});

		// Lưu tất cả các bản ghi đã cập nhật
		return this.thesisGroupRepository.save(thesisGroupList);
	}

	async delete(thesisGroupIds: string[]): Promise<boolean> {
		const result = await this.thesisGroupRepository.delete({ thesisGroupId: In(thesisGroupIds) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}


	private generateNewId = async (facultyId: string): Promise<string> => {
		// Find the last thesis for this faculty
		const lastTThesisGroup = await this.thesisGroupRepository.findOne({
			where: { thesisGroupId: Like(`${facultyId}%`) },
			order: { thesisGroupId: 'DESC' }
		});

		let numericPart = 1;
		if (lastTThesisGroup) {
			const match = lastTThesisGroup.thesisGroupId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
			const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

			numericPart = lastNumericPart + 1;
		}

		// Format the new ID
		return `${facultyId}TS${numericPart.toString().padStart(3, '0')}`;
	}

	async getWhere(condition: any): Promise<ThesisGroup[]> {
		const queryBuilder = this.thesisGroupRepository.createQueryBuilder('thesisgroup');

		// Kiểm tra và thêm điều kiện faculty nếu có
		if (condition.faculty) {
			queryBuilder.andWhere('thesisgroup.facultyId = :facultyId', { facultyId: condition.faculty });
		}

		// Kiểm tra và thêm điều kiện status nếu có
		if (condition.status) {
			queryBuilder.andWhere('thesisgroup.statusId = :statusId', { statusId: condition.status });
		}

		// Kiểm tra và thêm điều kiện thesisGroupId
		if (condition.thesisGroupId) {
			queryBuilder.andWhere('thesisgroup.thesisGroupId LIKE :thesisGroupId', { thesisGroupId: `%${condition.thesisGroupId}%` });
		}

		// Kiểm tra và thêm điều kiện thesisGroupName
		if (condition.thesisGroupName) {
			queryBuilder.andWhere('thesisgroup.thesisGroupName LIKE :thesisGroupName', { thesisGroupName: `%${condition.thesisGroupName}%` });
		}

		// Kiểm tra và thêm điều kiện startYear
		if (condition.startYear) {
			queryBuilder.andWhere('thesisgroup.startYear LIKE :startYear', { startYear: `%${condition.startYear}%` });
		}

		// Kiểm tra và thêm điều kiện finishYear
		if (condition.finishYear) {
			queryBuilder.andWhere('thesisgroup.finishYear LIKE :finishYear', { finishYear: `%${condition.finishYear}%` });
		}

		// Kiểm tra và xử lý condition.stillValue
		if (condition.stillValue) {
			const currentDate = new Date();
			queryBuilder.andWhere(
				'(thesisgroup.startCreateThesisDate IS NULL OR thesisgroup.startCreateThesisDate <= :currentDate)',
				{ currentDate }
			);
			queryBuilder.andWhere(
				'(thesisgroup.endCreateThesisDate IS NULL OR thesisgroup.endCreateThesisDate > :currentDate)',
				{ currentDate }
			);
		}

		// Kiểm tra và xử lý condition.disabled
		if (condition.disabled) {
			queryBuilder.andWhere(
				'(thesisgroup.isDisable <= :disabled)',
				{ disabled: condition.disabled }
			);
		}


		// Thêm mối quan hệ cần lấy
		queryBuilder.leftJoinAndSelect('thesisgroup.status', 'status')
			.leftJoinAndSelect('thesisgroup.faculty', 'faculty')
			.leftJoinAndSelect('thesisgroup.createUser', 'createUser')
			.leftJoinAndSelect('thesisgroup.lastModifyUser', 'lastModifyUser');

		queryBuilder.orderBy('thesisgroup.createDate', 'DESC');

		// Thực thi truy vấn và trả về kết quả
		const result = await queryBuilder.getMany();
		return result;
	}


	async importThesisGroup(data: any[], createUserId: string): Promise<ThesisGroup[]> {
		let thesisGroupSaved = [];
		for (const thesisGroup of data) {
			if (!thesisGroup.thesisGroupName) {
				continue;
			}
			const id = await this.generateNewId(thesisGroup.facultyId);
			thesisGroup.thesisGroupId = id;
			thesisGroup.createUserId = createUserId;
			thesisGroup.lastModifyUserId = createUserId;

			thesisGroupSaved.push(await this.create(thesisGroup));
		}
		return thesisGroupSaved;
	}

	async checkValidDateCreateThesis(thesisGroupId: string): Promise<boolean> {
		const queryBuilder = this.thesisGroupRepository.createQueryBuilder('tg');

		// Kiểm tra điều kiện thesisGroupId
		if (thesisGroupId) {
			queryBuilder.andWhere('tg.thesisGroupId LIKE :thesisGroupId', {
				thesisGroupId: thesisGroupId,
			});
		}

		// Điều kiện ngày hợp lệ
		const currentDate = new Date();
		queryBuilder.andWhere(
			'(tg.startCreateThesisDate IS NULL OR tg.startCreateThesisDate <= :currentDate) AND ' +
			'(tg.endCreateThesisDate IS NULL OR tg.endCreateThesisDate > :currentDate)',
			{ currentDate }
		);

		// Kiểm tra nếu có bất kỳ bản ghi nào thỏa mãn điều kiện
		const count = await queryBuilder.getCount();
		return count > 0; // Trả về true nếu có ít nhất một bản ghi
	}

}
