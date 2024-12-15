import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual, Not } from 'typeorm';
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
	private scientific_research_userRepository: Repository<ScientificResearch_User>;
	private userRepository: Repository<User>;
	private statusRepository: Repository<Status>;
	private scientificResearchGroupRepository: Repository<ScientificResearchGroup>;
	private facultyRepository: Repository<Faculty>;
	private attachRepository: Repository<Attach>;
	private followerRepository: Repository<Follower>;
	private messageRepository: Repository<Message>;

	constructor(dataSource: DataSource) {
		this.scientificResearchRepository = dataSource.getRepository(ScientificResearch);
		this.scientific_research_userRepository = dataSource.getRepository(ScientificResearch_User);
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

	async getById(scientificResearchId: string): Promise<any | null> {
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		queryBuilder
			.where('sr.scientificResearchId = :scientificResearchId', { scientificResearchId })
			.select([
				'sr.scientificResearchId as scientificResearchId',
				'sr.scientificResearchName as scientificResearchName',
				'sr.startDate as startDate',
				'sr.finishDate as finishDate',
				'sr.level as level',
				'sr.createDate as createDate',
				'sr.lastModifyDate as lastModifyDate',
				'sr.numberOfMember as numberOfMember',
				'sr.budget as budget',
				'sr.description as description',
				'status.statusId as statusId',
				'status.statusName as statusName',
				'status.color as color',
				'instructor.userId as instructorUserId',
				'instructor.fullname as instructorFullname',
				'createUser.userId as creatorUserId',
				'createUser.fullname as creatorFullname',
				'lastModifyUser.userId as lastModifierUserId',
				'lastModifyUser.fullname as lastModifierFullname',
				'faculty.facultyId as facultyId',
				'faculty.facultyName as facultyName',
				'sruUser.userId as userId',
				'sruUser.fullname as fullname',
				'sru.isLeader as isLeader',
				'sru.isApprove as isApprove',
				'follower.id as followerId',
				'followerDetail.id as followerDetailId',
				'followerUser.userId as followerUserId',
				'followerUser.fullname as followerFullname',
				'followerUser.avatar as followerAvatar',
				'scientificResearchGroup.scientificResearchGroupId as scientificResearchGroupId',
				'scientificResearchGroup.scientificResearchGroupName as scientificResearchGroupName',
			])
			.leftJoin('sr.status', 'status')
			.leftJoin('sr.instructor', 'instructor')
			.leftJoin('sr.createUser', 'createUser')
			.leftJoin('sr.lastModifyUser', 'lastModifyUser')
			.leftJoin('sr.scientificResearchGroup', 'scientificResearchGroup')
			.leftJoin('scientificResearchGroup.faculty', 'faculty')
			.leftJoin(ScientificResearch_User, 'sru', 'sru.scientificResearchId = sr.scientificResearchId')
			.leftJoin('sru.user', 'sruUser')
			.leftJoin('sr.follower', 'follower')
			.leftJoin('follower.followerDetails', 'followerDetail')
			.leftJoin('followerDetail.user', 'followerUser');

		const rawResults = await queryBuilder.getRawMany();

		if (!rawResults.length) {
			return null; // Trả về null nếu không có dữ liệu
		}

		const userSet = new Set<string>(); // Set để loại bỏ trùng lặp user
		const groupedResult = rawResults.reduce((acc, row) => {
			if (!acc.scientificResearchId) {
				acc = {
					scientificResearchId: row.scientificResearchId,
					scientificResearchName: row.scientificResearchName,
					startDate: row.startDate,
					finishDate: row.finishDate,
					level: row.level,
					createDate: row.createDate,
					lastModifyDate: row.lastModifyDate,
					numberOfMember: row.numberOfMember,
					budget: row.budget,
					description: row.description,
					scientificResearchGroup: {
						scientificResearchGroupId: row.scientificResearchGroupId,
						scientificResearchGroupName: row.scientificResearchGroupName,
						faculty: {
							facultyId: row.facultyId,
							facultyName: row.facultyName
						},
					},
					status: {
						statusId: row.statusId,
						statusName: row.statusName,
						color: row.color
					},
					instructor: {
						userId: row.instructorUserId,
						fullname: row.instructorFullname
					},
					createUser: {
						userId: row.creatorUserId,
						fullname: row.creatorFullname
					},
					lastModifyUser: {
						userId: row.lastModifierUserId,
						fullname: row.lastModifierFullname
					},
					users: [],
					follower: []
				};
			}

			// Thêm thông tin user từ ScientificResearch_User (không trùng lặp)
			if (row.userId && !userSet.has(row.userId)) {
				acc.users.push({
					userId: row.userId,
					fullname: row.fullname,
					isLeader: row.isLeader,
					isApprove: row.isApprove
				});
				userSet.add(row.userId); // Đánh dấu userId đã được thêm
			}

			// Thêm thông tin follower từ FollowerDetail
			if (row.followerId) {
				const existingFollower = acc.follower.find((f: any) => f.followerId === row.followerId);
				if (existingFollower) {
					// Nếu đã tồn tại follower, thêm thông tin chi tiết vào `followerDetails`
					if (row.followerUserId) {
						const userExists = existingFollower.followerDetails.some(
							(detail: any) => detail.userId === row.followerUserId
						);
						if (!userExists) {
							existingFollower.followerDetails.push({
								id: row.followerDetailId,
								userId: row.followerUserId,
								fullname: row.followerFullname,
								avatar: row.followerAvatar
							});
						}
					}
				} else {
					// Nếu chưa tồn tại follower, tạo mới
					acc.follower.push({
						followerId: row.followerId,
						followerDetails: row.followerUserId
							? [
								{
									id: row.followerDetailId,
									userId: row.followerUserId,
									fullname: row.followerFullname,
									avatar: row.followerAvatar
								}
							]
							: []
					});
				}
			}

			return acc;
		}, {});

		return groupedResult;
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
			{ repo: this.scientific_research_userRepository, name: 'dữ liệu đăng ký đề tài' },
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

	async getListSRJoined(condition: any): Promise<any[]> {
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		// Áp dụng điều kiện lọc
		if (condition.instructorId && condition.instructorId !== 'undefined') {
			queryBuilder.andWhere('sr.instructorId = :instructorId', {
				instructorId: condition.instructorId
			});
		}

		if (condition.scientificResearchGroup && condition.scientificResearchGroup !== 'undefined' && condition.scientificResearchGroup !== 'null') {
			queryBuilder.andWhere('sr.scientificResearchGroup = :scientificResearchGroup', {
				scientificResearchGroup: condition.scientificResearchGroup
			});
		}

		// Chọn các cột cần thiết
		queryBuilder
			.select([
				'sr.scientificResearchId as scientificResearchId',
				'sr.scientificResearchName scientificResearchName',
				'sr.startDate as startDate',
				'sr.finishDate as finishDate',
				'sr.level as level',
				'status.statusId as statusId',
				'status.statusName as statusName',
				'status.color as color',
				'user.userId as instructorUserId',
				'user.fullname as instructorFullname',
				'user2.userId as creatorUserId',
				'sru.isLeader as isLeader',
				'sru.isApprove as isApprove',
				'sruUser.userId as userId',
				'sruUser.fullname as fullname',
			])
			.leftJoin('sr.status', 'status')
			.leftJoin('sr.instructor', 'user')
			.leftJoin('sr.createUser', 'user2')
			.leftJoin(ScientificResearch_User, 'sru', 'sru.scientificResearchId = sr.scientificResearchId')
			.leftJoin('sru.user', 'sruUser')
			.orderBy('sr.createDate', 'DESC');

		const rawResults = await queryBuilder.getRawMany();

		// Gom nhóm người dùng theo scientificResearchId
		const groupedResults = rawResults.reduce((acc, row) => {
			const srId = row.scientificResearchId;

			if (!acc[srId]) {
				acc[srId] = {
					scientificResearchId: row.scientificResearchId,
					scientificResearchName: row.scientificResearchName,
					startDate: row.startDate,
					finishDate: row.finishDate,
					level: row.level,
					status: {
						statusId: row.statusId,
						statusName: row.statusName,
						color: row.color
					},
					instructor: {
						userId: row.instructorUserId,
						fullname: row.instructorFullname
					},
					createUser: {
						userId: row.creatorUserId
					},
					users: []
				};
			}

			if (row.userId) {
				acc[srId].users.push({
					userId: row.userId,
					fullname: row.fullname,
					isLeader: row.isLeader,
					isApprove: row.isApprove
				});
			}

			return acc;
		}, {});

		return Object.values(groupedResults);
	}


	/**
	 * Lấy danh sách đề tài theo scientificResearchGroupId và kiểm tra trạng thái duyệt
	 * @param scientificResearchGroupId ID của nhóm đề tài nghiên cứu khoa học
	 * @param userId ID của người dùng cần kiểm tra trạng thái duyệt
	 * @returns Danh sách các đề tài cùng với thông tin số lượng đăng ký và trạng thái duyệt của người dùng
	 */
	public getBySRGIdAndCheckApprove = async (scientificResearchGroupId: string, userId: string): Promise<any[]> => {
		// Tạo queryBuilder cho bảng scientificResearch
		const queryBuilder = this.scientificResearchRepository.createQueryBuilder('sr');

		// Thêm điều kiện lọc theo nhóm hoặc lọc theo trạng thái
		if (scientificResearchGroupId && scientificResearchGroupId !== "null") {
			queryBuilder.andWhere(
				'sr.scientificResearchGroupId = :scientificResearchGroupId AND sr.isDisable = false', {
				scientificResearchGroupId
			});
		} else {
			queryBuilder.andWhere('sr.isDisable = false');
		}

		// Chọn các cột cần thiết và thêm thông tin liên kết
		queryBuilder
			.select([
				'sr.scientificResearchId',
				'sr.scientificResearchName',
				'sr.startDate',
				'sr.finishDate',
				'status.statusId',
				'status.statusName',
				'status.color',
				'instructor.userId',
				'instructor.fullname',
				'faculty.facultyId',
				'faculty.facultyName'
			])
			.leftJoin('sr.status', 'status')
			.leftJoin('sr.instructor', 'instructor')
			.leftJoin('sr.scientificResearchGroup', 'scientificResearchGroup')
			.leftJoin('scientificResearchGroup.faculty', 'faculty')
			.leftJoin('sr.follower', 'follower')
			.leftJoin('follower.followerDetails', 'follower_detail')
			.leftJoin('follower_detail.user', 'followerUser')
			.addSelect(['followerUser.userId', 'followerUser.fullname', 'followerUser.avatar'])
			.leftJoin('sr.createUser', 'user2')
			.addSelect(['user2.userId'])
			.orderBy('sr.createDate', 'DESC');

		// Lấy danh sách đề tài
		const listSR = await queryBuilder.getMany();

		// Tạo danh sách ID để kiểm tra đăng ký
		const scientificResearchIds = listSR.map(sr => sr.scientificResearchId);

		// Lấy tất cả bản ghi đăng ký liên quan đến danh sách đề tài và người dùng
		const registrations = await this.scientific_research_userRepository.find({
			where: { scientificResearch: { scientificResearchId: In(scientificResearchIds) } },
			relations: ['scientificResearch', 'user']
		});

		// Tạo map để đếm số lượng đăng ký và kiểm tra trạng thái duyệt
		const registrationMap = new Map();
		registrations.forEach(reg => {
			const { scientificResearchId } = reg.scientificResearch;
			const { userId: regUserId } = reg.user;
			const { isApprove } = reg;

			if (!registrationMap.has(scientificResearchId)) {
				registrationMap.set(scientificResearchId, {
					count: 0,
					approveForUser: false,
					hasOtherApproved: false
				});
			}

			const data = registrationMap.get(scientificResearchId);
			data.count += 1;
			if (regUserId === userId) {
				data.approveForUser = isApprove;
			} else if (isApprove) {
				data.hasOtherApproved = true;
			}
		});

		// Kết hợp dữ liệu để trả về kết quả cuối cùng
		const result = listSR
			.map(sr => {
				const regData = registrationMap.get(sr.scientificResearchId) || { count: 0, approveForUser: false, hasOtherApproved: false };
				if (regData.hasOtherApproved) {
					return null;
				}
				return {
					...sr,
					count: regData.count,
					approveForUser: regData.approveForUser
				};
			})
			.filter(item => item !== null);

		return result;
	};




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

