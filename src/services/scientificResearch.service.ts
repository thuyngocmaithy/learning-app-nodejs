// scientificResearch.service.ts
import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { ScientificResearch } from '../entities/ScientificResearch';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';
import { AppDataSource } from '../data-source';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { ScientificResearch_User } from '../entities/ScientificResearch_User';

export class ScientificResearchService {
	private scientificResearchRepository: Repository<ScientificResearch>;
	private scientificResearch_UserRepository: Repository<ScientificResearch_User>;
	private userRepository: Repository<User>;
	private statusRepository: Repository<Status>;
	private scientificResearchGroupRepository: Repository<ScientificResearchGroup>;
	private facultyRepository: Repository<Faculty>;

	constructor(dataSource: DataSource) {
		this.scientificResearchRepository = dataSource.getRepository(ScientificResearch);
		this.scientificResearch_UserRepository = dataSource.getRepository(ScientificResearch_User);
		this.userRepository = dataSource.getRepository(User);
		this.statusRepository = dataSource.getRepository(Status);
		this.scientificResearchGroupRepository = dataSource.getRepository(ScientificResearchGroup);
		this.facultyRepository = dataSource.getRepository(Faculty);
	}

	async getAll(): Promise<ScientificResearch[]> {
		return this.scientificResearchRepository.find({
			order: { createDate: 'DESC' },
			relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower', 'scientificResearchGroup']
		});
	}

	async getById(scientificResearchId: string): Promise<ScientificResearch | null> {
		return this.scientificResearchRepository.findOne({
			where: { scientificResearchId },
			relations: [
				'status',
				'instructor',
				'createUser',
				'lastModifyUser',
				'follower',
				'follower.followerDetails',
				'follower.followerDetails.user',
				'scientificResearchGroup.faculty',
				'scientificResearchGroup'
			]
		});
	}

	public create = async (scientificResearchData: any): Promise<ScientificResearch> => {
		const faculty = await this.facultyRepository.findOne({ where: { facultyId: scientificResearchData.facultyId } });
		if (!faculty) {
			throw new Error('Invalid faculty ID');
		}

		const instructor = await this.userRepository.findOne({ where: { userId: scientificResearchData.instructorId } });
		if (!instructor) {
			throw new Error('Invalid instructor ID');
		}

		const status = await this.statusRepository.findOne({ where: { statusId: scientificResearchData.statusId } });
		if (!status) {
			throw new Error('Invalid Status ID');
		}

		const scientificResearchGroup = await this.scientificResearchGroupRepository.findOne({
			where: { scientificResearchGroupId: scientificResearchData.scientificResearchGroup },
			relations: ["faculty"]
		});
		if (!scientificResearchGroup) {
			throw new Error('Invalid ScientificResearchGroups ID');
		}

		const newId = await this.generateNewId(scientificResearchGroup.faculty.facultyId);

		const followerDetails = [{ user: scientificResearchData.createUserId }];

		// Nếu instructor khác với createUserId, thêm instructor vào followerDetails
		if (scientificResearchData.instructorId !== scientificResearchData.createUserId.userId) {
			followerDetails.push({ user: instructor });
		}

		const scientificResearch = this.scientificResearchRepository.create({
			scientificResearchId: newId,
			scientificResearchName: scientificResearchData.scientificResearchName,
			description: scientificResearchData.description,
			numberOfMember: scientificResearchData.numberOfMember,
			instructor: instructor,
			status: status,
			createUser: scientificResearchData.createUserId,
			lastModifyUser: scientificResearchData.lastModifyUserId,
			scientificResearchGroup: scientificResearchGroup,
			follower: [
				{
					followerDetails: followerDetails
				}
			],
			startDate: scientificResearchData.startDate,
			finishDate: scientificResearchData.finishDate
		});

		const savedScientificResearch = await this.scientificResearchRepository.save(scientificResearch);

		return savedScientificResearch;
	}


	async update(scientificResearchId: string, data: Partial<ScientificResearch>): Promise<ScientificResearch | null> {
		const scientificResearch = await this.scientificResearchRepository.findOne({ where: { scientificResearchId } });
		if (!scientificResearch) {
			return null;
		}

		const status = await AppDataSource.getRepository(Status)
			.createQueryBuilder("status")
			.where("status.statusId = :statusId", { statusId: data.status })
			.getOne();

		if (status) {
			scientificResearch.status = status;
		}

		this.scientificResearchRepository.merge(scientificResearch, data);
		return this.scientificResearchRepository.save(scientificResearch);
	}

	async updateMulti(scientificResearchId: string[], data: Partial<ScientificResearch>): Promise<ScientificResearch[] | null> {
		// Tìm tất cả các bản ghi với scientificResearchId trong mảng
		const scientificResearchList = await this.scientificResearchRepository.find({
			where: { scientificResearchId: In(scientificResearchId) }
		});

		// Nếu không tìm thấy bản ghi nào
		if (scientificResearchList.length === 0) {
			return null;
		}

		// Cập nhật từng bản ghi
		scientificResearchList.forEach((scientificResearch) => {
			this.scientificResearchRepository.merge(scientificResearch, data);
		});

		// Lưu tất cả các bản ghi đã cập nhật
		return this.scientificResearchRepository.save(scientificResearchList);
	}

	async delete(scientificResearchIds: string[]): Promise<boolean> {
		const result = await this.scientificResearchRepository.delete({ scientificResearchId: In(scientificResearchIds) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}


	private generateNewId = async (facultyId: string): Promise<string> => {
		// Find the last thesis for this faculty
		const lastTScientificResearch = await this.scientificResearchRepository.findOne({
			where: { scientificResearchId: Like(`${facultyId}%`) },
			order: { scientificResearchId: 'DESC' }
		});

		let numericPart = 1;
		if (lastTScientificResearch) {
			const match = lastTScientificResearch.scientificResearchId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
			const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

			numericPart = lastNumericPart + 1;
		}
		// Format the new ID
		return `${facultyId}PROJECT${numericPart.toString().padStart(3, '0')}`;
	}

	public getByScientificResearchGroupId = async (scientificResearchGroupId: string): Promise<ScientificResearch[]> => {
		const options: FindManyOptions<ScientificResearch> = {
			where: { scientificResearchGroup: { scientificResearchGroupId: scientificResearchGroupId } },
			relations: [
				'status',
				'instructor',
				'createUser',
				'lastModifyUser',
				'follower',
				'follower.followerDetails',
				'follower.followerDetails.user',
				'scientificResearchGroup.faculty'
			]
		};
		return this.scientificResearchRepository.find(options);
	}

	async getWhere(condition: any): Promise<ScientificResearch[]> {
		const whereCondition: any = {};
		if (condition.stillValue) {
			whereCondition.scientificResearchGroup = { startCreateSRDate: LessThanOrEqual(new Date()) };
			whereCondition.scientificResearchGroup = { endCreateSRDate: MoreThan(new Date()) };
		}
		if (condition.scientificResearchId) {
			whereCondition.scientificResearchId = Like(`%${condition.scientificResearchId}%`);
		}
		if (condition.scientificResearchName) {
			whereCondition.scientificResearchName = Like(`%${condition.scientificResearchName}%`);
		}
		if (condition.level) {
			whereCondition.level = condition.level;
		}
		if (condition.status) {
			whereCondition.status = { statusId: condition.status };
		}
		if (condition.isDisable) {
			whereCondition.isDisable = condition.isDisable;
		}
		if (condition.instructorId) {
			whereCondition.instructor = { userId: condition.instructorId };
		}
		if (condition.instructorName) {
			whereCondition.instructor = { fullname: Like(`%${condition.instructorName}%`) };
		}
		if (condition.scientificResearchGroup) {
			whereCondition.scientificResearchGroup = { scientificResearchGroupId: condition.scientificResearchGroup };
		}

		return this.scientificResearchRepository.find({
			order: { createDate: 'DESC' },
			where: whereCondition,
			relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower'],
		});
	}


	public getBySRGIdAndCheckApprove = async (scientificResearchGroupId: string, userId: string): Promise<any[]> => {
		// Tạo điều kiện where theo scientificResearchGroupId
		const whereCondition = (scientificResearchGroupId && scientificResearchGroupId !== "null")
			? {
				scientificResearchGroup: { scientificResearchGroupId: scientificResearchGroupId },
				isDisable: false
			}
			: { isDisable: false }; // Bỏ qua điều kiện scientificResearchGroup nếu scientificResearchGroupId là null

		const options: FindManyOptions<ScientificResearch> = {
			where: whereCondition,
			relations: [
				'status',
				'instructor',
				'createUser',
				'lastModifyUser',
				'follower',
				'follower.followerDetails',
				'follower.followerDetails.user',
				'scientificResearchGroup.faculty'
			]
		};
		const listSR = await this.scientificResearchRepository.find(options);

		const promises = listSR.map(async (SR) => {
			const responseCountRegister = await this.scientificResearch_UserRepository.findBy({ scientificResearch: { scientificResearchId: SR.scientificResearchId } });
			const count = responseCountRegister.length;

			const responseUserRegister = await this.scientificResearch_UserRepository.findOneBy(
				{
					scientificResearch: { scientificResearchId: SR.scientificResearchId },
					user: { userId: userId }
				}
			);
			const approve = responseUserRegister?.isApprove;

			return { ...SR, count, approve };
		});

		// Đợi tất cả các Promise hoàn thành
		const result = await Promise.all(promises);

		return result;
	}

}

