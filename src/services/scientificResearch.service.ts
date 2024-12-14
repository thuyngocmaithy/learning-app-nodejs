import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { ScientificResearch } from '../entities/ScientificResearch';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';
import { AppDataSource } from '../data-source';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { ScientificResearch_User } from '../entities/ScientificResearch_User';
import { Attach } from '../entities/Attach';
import { Follower } from '../entities/Follower';
import { Message } from '../entities/Message';

export class ScientificResearchService {
	private scientificResearchRepository: Repository<ScientificResearch>;
	private scientificResearch_UserRepository: Repository<ScientificResearch_User>;
	private userRepository: Repository<User>;
	private statusRepository: Repository<Status>;
	private scientificResearchGroupRepository: Repository<ScientificResearchGroup>;
	private facultyRepository: Repository<Faculty>;
	private attachRepository: Repository<Attach>;
	private followerRepository: Repository<Follower>;
	private messageRepository: Repository<Message>;

	constructor(dataSource: DataSource) {
		this.scientificResearchRepository = dataSource.getRepository(ScientificResearch);
		this.scientificResearch_UserRepository = dataSource.getRepository(ScientificResearch_User);
		this.userRepository = dataSource.getRepository(User);
		this.statusRepository = dataSource.getRepository(Status);
		this.scientificResearchGroupRepository = dataSource.getRepository(ScientificResearchGroup);
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.attachRepository = dataSource.getRepository(Attach);
		this.followerRepository = dataSource.getRepository(Follower);
		this.messageRepository = dataSource.getRepository(Message);
	}

	async getAll(): Promise<ScientificResearch[]> {
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		queryBuilder.select([
			'sr.scientificResearchId',
			'sr.scientificResearchName',
			'sr.startDate',
			'sr.finishDate',
			'sr.description',
			'sr.numberOfMember',
			'sr.level',
			'sr.budget',
			'sr.isDisable',
		]);
		queryBuilder
			.leftJoin('sr.instructor', 'user')
			.addSelect(['user.userId', 'user.fullname']);

		queryBuilder
			.leftJoin('sr.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('sr.createUser', 'user2')
			.addSelect(['user2.userId']);

		queryBuilder.orderBy('sr.createDate', 'DESC');
		return queryBuilder.getMany();
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

		const status = await this.statusRepository.findOne({ where: { statusId: scientificResearchData.status } });
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
		if ((scientificResearchData.instructorId !== scientificResearchData.createUserId.userId)
			&& (scientificResearchData.instructor.userId !== scientificResearchData.createUserId.userId)
		) {
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


	async checkRelatedData(scientificResearchIds: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.attachRepository, name: 'dữ liệu đính kèm' },
			{ repo: this.followerRepository, name: 'dữ liệu người theo dõi' },
			{ repo: this.messageRepository, name: 'dữ liệu tin nhắn' },
			{ repo: this.scientificResearch_UserRepository, name: 'dữ liệu đăng ký đề tài' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { scientificResearch: { scientificResearchId: In(scientificResearchIds) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Đề tài NCKH đang được sử dụng trong ${name}. Bạn có chắc chắn xóa?`,
				};
			}
		}

		return { success: true };
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
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		if (scientificResearchGroupId) {
			queryBuilder.andWhere('sr.scientificResearchGroupId = :scientificResearchGroupId', {
				scientificResearchGroupId: scientificResearchGroupId
			});
		}

		queryBuilder.select([
			'sr.scientificResearchGroupId',
			'sr.scientificResearchId',
			'sr.scientificResearchName',
			'sr.startDate',
			'sr.finishDate',
			'sr.description',
			'sr.numberOfMember',
			'sr.level',
			'sr.isDisable',
		]);
		queryBuilder
			.leftJoin('sr.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('sr.instructor', 'user')
			.addSelect(['user.fullname', 'user.userId']);

		queryBuilder
			.leftJoin('sr.createUser', 'user2')
			.addSelect(['user2.userId']);

		queryBuilder.orderBy('sr.createDate', 'DESC');
		return queryBuilder.getMany();
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
			relations: ['status', 'instructor', 'follower'],
		});
	}

	async getListSRJoined(condition: any): Promise<ScientificResearch[]> {
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		if (condition.instructorId && condition.instructorId !== 'undefined') {
			queryBuilder.andWhere('sr.instructorId = :instructorId', {
				instructorId: condition.instructorId
			});
		}

		if (condition.scientificResearchGroup && condition.scientificResearchGroup !== 'undefined') {
			queryBuilder.andWhere('sr.scientificResearchGroup = :scientificResearchGroup', {
				scientificResearchGroup: condition.scientificResearchGroup
			});
		}
		queryBuilder.select([
			'sr.scientificResearchId',
			'sr.scientificResearchName',
			'sr.startDate',
			'sr.finishDate'
		]);
		queryBuilder
			.leftJoin('sr.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('sr.instructor', 'user')
			.addSelect(['user.userId', 'user.fullname']);

		queryBuilder
			.leftJoin('sr.createUser', 'user2')
			.addSelect(['user2.userId']);

		queryBuilder.orderBy('sr.createDate', 'DESC');

		return queryBuilder.getMany();
	}


	public getBySRGIdAndCheckApprove = async (scientificResearchGroupId: string, userId: string): Promise<any[]> => {
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		if (scientificResearchGroupId && scientificResearchGroupId !== "null") {
			queryBuilder.andWhere(
				'sr.scientificResearchGroupId = :scientificResearchGroupId ' +
				'AND sr.isDisable = false', {
				scientificResearchGroupId: scientificResearchGroupId
			});
		}
		else {
			queryBuilder.andWhere('sr.isDisable = false');
		}

		queryBuilder.select([
			'sr.scientificResearchId',
			'sr.scientificResearchName',
			'sr.startDate',
			'sr.finishDate'
		]);
		queryBuilder
			.leftJoin('sr.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('sr.instructor', 'instructor')
			.addSelect(['instructor.userId', 'instructor.fullname']);

		queryBuilder
			.leftJoin('sr.scientificResearchGroup', 'scientificResearchGroup')
			.leftJoin('scientificResearchGroup.faculty', 'faculty')
			.addSelect(['faculty.facultyId', 'faculty.facultyName']);


		queryBuilder
			.leftJoin('sr.follower', 'follower')
			.leftJoin('follower.followerDetails', 'follower_detail')
			.leftJoin('follower_detail.user', 'followerUser')
			.addSelect(['followerUser.userId', 'followerUser.fullname', 'followerUser.avatar']);

		queryBuilder
			.leftJoin('sr.createUser', 'user2')
			.addSelect(['user2.userId']);

		queryBuilder.orderBy('sr.createDate', 'DESC');

		const listSR = await queryBuilder.getMany();

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

	public async importScientificResearch(data: any[], createUserId: string): Promise<ScientificResearch[]> {
		let scientificResearchSaved = [];
		for (const scientificResearch of data) {
			// Kiểm tra và chuyển đổi nhóm đề tài
			if (scientificResearch.scientificResearchGroupId) {
				const entity = await this.scientificResearchGroupRepository.findOneBy({ scientificResearchGroupId: scientificResearch.scientificResearchGroupId });
				if (entity) {
					scientificResearch.scientificResearchGroup = entity;
				} else {
					scientificResearch.scientificResearchGroup = null;
				}
			}
			// Kiểm tra và chuyển đổi trạng thái
			if (scientificResearch.statusId) {
				const entity = await this.statusRepository.findOneBy({ statusId: scientificResearch.statusId });
				if (entity) {
					scientificResearch.status = entity;
				} else {
					scientificResearch.status = null;
				}
			}
			// Kiểm tra và chuyển đổi gv hướng dẫn
			if (scientificResearch.instructorName) {
				const entity = await this.userRepository.findOneBy({ fullname: Like(`%${scientificResearch.instructorName}%`) });
				if (entity) {
					scientificResearch.instructor = entity;
				} else {
					scientificResearch.instructor = null;
				}
			}
			// Kiểm tra và chuyển đổi người tạo
			if (createUserId) {
				const entity = await this.userRepository.findOneBy({ userId: createUserId });
				if (entity) {
					scientificResearch.createUserId = entity;
				}
			}

			scientificResearchSaved.push(await this.create(scientificResearch));
		}
		return scientificResearchSaved;
	}
}

