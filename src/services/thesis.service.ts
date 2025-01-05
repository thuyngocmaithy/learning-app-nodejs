import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { Thesis } from '../entities/Thesis';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';
import { AppDataSource } from '../data-source';
import { ThesisGroup } from '../entities/ThesisGroup';
import { Thesis_User } from '../entities/Thesis_User';
import { Attach } from '../entities/Attach';
import { Follower } from '../entities/Follower';
import { Message } from '../entities/Message';

export class ThesisService {
	private thesisRepository: Repository<Thesis>;
	private thesis_UserRepository: Repository<Thesis_User>;
	private userRepository: Repository<User>;
	private statusRepository: Repository<Status>;
	private thesisGroupRepository: Repository<ThesisGroup>;
	private facultyRepository: Repository<Faculty>;
	private attachRepository: Repository<Attach>;
	private followerRepository: Repository<Follower>;
	private messageRepository: Repository<Message>;

	constructor(dataSource: DataSource) {
		this.thesisRepository = dataSource.getRepository(Thesis);
		this.thesis_UserRepository = dataSource.getRepository(Thesis_User);
		this.userRepository = dataSource.getRepository(User);
		this.statusRepository = dataSource.getRepository(Status);
		this.thesisGroupRepository = dataSource.getRepository(ThesisGroup);
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.attachRepository = dataSource.getRepository(Attach);
		this.followerRepository = dataSource.getRepository(Follower);
		this.messageRepository = dataSource.getRepository(Message);
	}

	async getAll(): Promise<Thesis[]> {
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		queryBuilder.select([
			'thesis.thesisId',
			'thesis.thesisName',
			'thesis.startDate',
			'thesis.finishDate',
			'thesis.description',
			'thesis.numberOfMember',
			'thesis.budget',
			'thesis.isDisable',
		]);
		queryBuilder
			.leftJoin('thesis.instructor', 'user1')
			.addSelect(['user1.userId', 'user1.fullname']);

		queryBuilder
			.leftJoin('thesis.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('thesis.createUser', 'user2')
			.addSelect(['user2.userId']);

		queryBuilder.orderBy("thesis.createDate", 'DESC');
		return queryBuilder.getMany();
	}

	async getById(thesisId: string): Promise<any | null> {
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		queryBuilder
			.where('thesis.thesisId = :thesisId', { thesisId })
			.select([
				'thesis.thesisId as thesisId',
				'thesis.thesisName as thesisName',
				'thesis.startDate as startDate',
				'thesis.finishDate as finishDate',
				'thesis.createDate as createDate',
				'thesis.lastModifyDate as lastModifyDate',
				'thesis.numberOfMember as numberOfMember',
				'thesis.budget as budget',
				'thesis.description as description',
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
				'group.thesisGroupId as groupId',
				'group.thesisGroupName as groupName',
				'group.facultyId as groupFacultyId',
				'user.userId as userId',
				'user.fullname as userFullname',
				'userThesis.isLeader as isLeader',
				'userThesis.isApprove as isApprove',
				'follower.id as followerId',
				'followerDetail.id as followerDetailId',
				'followerUser.userId as followerUserId',
				'followerUser.fullname as followerFullname',
				'followerUser.avatar as followerAvatar',
			])
			.leftJoin('thesis.status', 'status')
			.leftJoin('thesis.instructor', 'instructor')
			.leftJoin('thesis.createUser', 'createUser')
			.leftJoin('thesis.lastModifyUser', 'lastModifyUser')
			.leftJoin('thesis.thesisGroup', 'group')
			.leftJoin('group.faculty', 'faculty')
			.leftJoin(Thesis_User, 'userThesis', 'userThesis.thesisId = thesis.thesisId') // Liên kết bảng trung gian Thesis_User
			.leftJoin('userThesis.user', 'user') // Lấy thông tin user từ bảng liên kết
			.leftJoin('thesis.follower', 'follower')
			.leftJoin('follower.followerDetails', 'followerDetail')
			.leftJoin('followerDetail.user', 'followerUser');

		const rawResults = await queryBuilder.getRawMany();

		if (!rawResults.length) {
			return null; // Trả về null nếu không có dữ liệu
		}

		const userSet = new Set<string>(); // Set để loại bỏ trùng lặp user
		const groupedResult = rawResults.reduce((acc, row) => {
			if (!acc.thesisId) {
				acc = {
					thesisId: row.thesisId,
					thesisName: row.thesisName,
					startDate: row.startDate,
					finishDate: row.finishDate,
					createDate: row.createDate,
					lastModifyDate: row.lastModifyDate,
					numberOfMember: row.numberOfMember,
					budget: row.budget,
					description: row.description,
					status: {
						statusId: row.statusId,
						statusName: row.statusName,
						color: row.color,
					},
					instructor: {
						userId: row.instructorUserId,
						fullname: row.instructorFullname,
					},
					createUser: {
						userId: row.creatorUserId,
						fullname: row.creatorFullname,
					},
					lastModifyUser: {
						userId: row.lastModifierUserId,
						fullname: row.lastModifierFullname,
					},
					thesisGroup: {
						thesisGroupId: row.groupId,
						thesisGroupName: row.groupName,
						faculty: {
							facultyId: row.facultyId,
							facultyName: row.facultyName,
						},
					},
					users: [],
					follower: [],
				};
			}

			// Thêm thông tin user từ Thesis_User (không trùng lặp)
			if (row.userId && !userSet.has(row.userId)) {
				acc.users.push({
					userId: row.userId,
					fullname: row.userFullname,
					isLeader: row.isLeader,
					isApprove: row.isApprove,
				});
				userSet.add(row.userId); // Đánh dấu userId đã được thêm
			}

			// Thêm thông tin follower từ FollowerDetail
			if (row.followerId) {
				const existingFollower = acc.follower.find((f: any) => f.followerId === row.followerId);
				if (existingFollower) {
					// Nếu đã tồn tại follower, thêm thông tin chi tiết
					if (row.followerUserId) {
						const userExists = existingFollower.followerDetails.some(
							(detail: any) => detail.userId === row.followerUserId
						);
						if (!userExists) {
							existingFollower.followerDetails.push({
								id: row.followerDetailId,
								userId: row.followerUserId,
								fullname: row.followerFullname,
								avatar: row.followerAvatar,
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
									avatar: row.followerAvatar,
								},
							]
							: [],
					});
				}
			}

			return acc;
		}, {});

		return groupedResult;
	}



	public create = async (thesisData: any): Promise<Thesis> => {
		const faculty = await this.facultyRepository.findOne({ where: { facultyId: thesisData.facultyId } });
		if (!faculty) {
			throw new Error('Invalid faculty ID');
		}

		const instructor = await this.userRepository.findOne({ where: { userId: thesisData.instructorId } });
		if (!instructor) {
			throw new Error('Invalid instructor ID');
		}

		const status = await this.statusRepository.findOne({ where: { statusId: thesisData.status } });
		if (!status) {
			throw new Error('Invalid Status ID');
		}

		const thesisGroup = await this.thesisGroupRepository.findOne({
			where: { thesisGroupId: thesisData.thesisGroup },
			relations: ["faculty"]
		});
		if (!thesisGroup) {
			throw new Error('Invalid ThesisGroups ID');
		}

		const newId = await this.generateNewId(thesisGroup.faculty.facultyId);

		const followerDetails = [{ user: thesisData.createUserId }];

		// Nếu instructor khác với createUserId, thêm instructor vào followerDetails
		if (thesisData.instructorId !== thesisData.createUserId.userId) {
			followerDetails.push({ user: instructor });
		}

		const thesis = this.thesisRepository.create({
			thesisId: newId,
			thesisName: thesisData.thesisName,
			description: thesisData.description,
			numberOfMember: thesisData.numberOfMember,
			instructor: instructor,
			status: status,
			createUser: thesisData.createUserId,
			lastModifyUser: thesisData.lastModifyUserId,
			thesisGroup: thesisGroup,
			follower: [
				{
					followerDetails: followerDetails
				}
			],
			startDate: thesisData.startDate,
			finishDate: thesisData.finishDate
		});

		const savedThesis = await this.thesisRepository.save(thesis);

		return savedThesis;
	}


	async update(thesisId: string, data: Partial<Thesis>): Promise<Thesis | null> {
		const thesis = await this.thesisRepository.findOne({ where: { thesisId } });
		if (!thesis) {
			return null;
		}

		const status = await AppDataSource.getRepository(Status)
			.createQueryBuilder("status")
			.where("status.statusId = :statusId", { statusId: data.status })
			.getOne();

		if (status) {
			thesis.status = status;
		}

		this.thesisRepository.merge(thesis, data);
		return this.thesisRepository.save(thesis);
	}

	async updateMulti(thesisId: string[], data: Partial<Thesis>): Promise<Thesis[] | null> {
		// Tìm tất cả các bản ghi với thesisId trong mảng
		const thesisList = await this.thesisRepository.find({
			where: { thesisId: In(thesisId) }
		});

		// Nếu không tìm thấy bản ghi nào
		if (thesisList.length === 0) {
			return null;
		}

		// Cập nhật từng bản ghi
		thesisList.forEach((thesis) => {
			this.thesisRepository.merge(thesis, data);
		});

		// Lưu tất cả các bản ghi đã cập nhật
		return this.thesisRepository.save(thesisList);
	}


	async checkRelatedData(thesisIds: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.attachRepository, name: 'dữ liệu đính kèm' },
			{ repo: this.followerRepository, name: 'dữ liệu người theo dõi' },
			{ repo: this.messageRepository, name: 'dữ liệu tin nhắn' },
			{ repo: this.thesis_UserRepository, name: 'dữ liệu đăng ký đề tài' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { thesis: { thesisId: In(thesisIds) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Đề tài khóa luận đang được sử dụng trong ${name}. Bạn có chắc chắn xóa?`,
				};
			}
		}

		return { success: true };
	}


	async delete(thesisIds: string[]): Promise<boolean> {
		const result = await this.thesisRepository.delete({ thesisId: In(thesisIds) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}


	private generateNewId = async (facultyId: string): Promise<string> => {
		// Find the last thesis for this faculty
		const lastTThesis = await this.thesisRepository.findOne({
			where: { thesisId: Like(`${facultyId}%`) },
			order: { thesisId: 'DESC' }
		});

		let numericPart = 1;
		if (lastTThesis) {
			const match = lastTThesis.thesisId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
			const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

			numericPart = lastNumericPart + 1;
		}
		// Format the new ID
		return `${facultyId}THESIS${numericPart.toString().padStart(3, '0')}`;
	}

	public getByThesisGroupId = async (thesisGroupId: string): Promise<Thesis[]> => {
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		if (thesisGroupId) {
			queryBuilder.andWhere('thesis.thesisGroupId = :thesisGroupId', {
				thesisGroupId: thesisGroupId
			});
		}

		queryBuilder.select([
			'thesis.thesisGroupId',
			'thesis.thesisId',
			'thesis.thesisName',
			'thesis.startDate',
			'thesis.finishDate',
			'thesis.description',
			'thesis.description',
			'thesis.numberOfMember',
			'thesis.isDisable',
		]);
		queryBuilder
			.leftJoin('thesis.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('thesis.instructor', 'user')
			.addSelect(['user.fullname', 'user.userId']);

		queryBuilder
			.leftJoin('thesis.createUser', 'user2')
			.addSelect(['user2.userId']);

		queryBuilder.orderBy('thesis.createDate', 'DESC');
		return queryBuilder.getMany();
	}

	async getWhere(condition: any): Promise<Thesis[]> {
		const whereCondition: any = {};
		if (condition.stillValue) {
			whereCondition.thesisGroup = { startCreateThesisDate: LessThanOrEqual(new Date()) };
			whereCondition.thesisGroup = { endCreateThesisDate: MoreThan(new Date()) };
		}
		if (condition.thesisId) {
			whereCondition.thesisId = Like(`%${condition.thesisId}%`);
		}
		if (condition.thesisName) {
			whereCondition.thesisName = Like(`%${condition.thesisName}%`);
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
		if (condition.thesisGroup) {
			whereCondition.thesisGroup = { thesisGroupId: condition.thesisGroup };
		}

		if (condition.facultyId) {
			whereCondition.thesisGroup = { faculty: { facultyId: condition.facultyId } };
		}


		return this.thesisRepository.find({
			order: { createDate: 'DESC' },
			where: whereCondition,
			relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower'],
		});
	}


	async getListThesisJoined(condition: any): Promise<any[]> {
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		// Áp dụng điều kiện lọc
		if (condition.instructorId && condition.instructorId !== 'undefined') {
			queryBuilder.andWhere('thesis.instructorId = :instructorId', {
				instructorId: condition.instructorId
			});
		}

		if (condition.thesisGroup && condition.thesisGroup !== 'undefined' && condition.thesisGroup !== 'null') {
			queryBuilder.andWhere('thesis.thesisGroup = :thesisGroup', {
				thesisGroup: condition.thesisGroup
			});
		}

		// Chọn các cột cần thiết
		queryBuilder
			.select([
				'thesis.thesisId as thesisId',
				'thesis.thesisName as thesisName',
				'thesis.startDate as startDate',
				'thesis.finishDate as finishDate',
				'status.statusId as statusId',
				'status.statusName as statusName',
				'status.color as color',
				'user.userId as instructorUserId',
				'user.fullname as instructorFullname',
				'user2.userId as creatorUserId',
				'thesisUser.isLeader as isLeader',
				'thesisUser.isApprove as isApprove',
				'userDetail.userId as userId',
				'userDetail.fullname as fullname'
			])
			.leftJoin('thesis.status', 'status')
			.leftJoin('thesis.instructor', 'user')
			.leftJoin('thesis.createUser', 'user2')
			.leftJoin(Thesis_User, 'thesisUser', 'thesisUser.thesisId = thesis.thesisId')
			.leftJoin('thesisUser.user', 'userDetail')
			.orderBy('thesis.createDate', 'DESC');

		const rawResults = await queryBuilder.getRawMany();

		// Gom nhóm người dùng theo thesisId
		const groupedResults = rawResults.reduce((acc, row) => {
			const thesisId = row.thesisId;

			if (!acc[thesisId]) {
				acc[thesisId] = {
					thesisId: row.thesisId,
					thesisName: row.thesisName,
					startDate: row.startDate,
					finishDate: row.finishDate,
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
				acc[thesisId].users.push({
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
	 * Lấy danh sách khóa luận theo thesisGroupId và kiểm tra trạng thái duyệt
	 * @param thesisGroupId ID của nhóm khóa luận
	 * @param userId ID của người dùng cần kiểm tra trạng thái duyệt
	 * @returns Danh sách các khóa luận cùng với thông tin số lượng đăng ký và trạng thái duyệt của người dùng
	 */
	public getByThesisGroupIdAndCheckApprove = async (thesisGroupId: string, userId: string, facultyId: string): Promise<any[]> => {
		// Tạo queryBuilder cho bảng thesis
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		// Thêm điều kiện lọc theo nhóm hoặc lọc theo trạng thái
		if (thesisGroupId && thesisGroupId !== "null") {
			queryBuilder.andWhere(
				'thesis.thesisGroupId = :thesisGroupId AND thesis.isDisable = false', {
				thesisGroupId
			});
		} else {
			queryBuilder.andWhere('thesis.isDisable = false');
		}

		// Thêm điều kiện lọc theo facultyId nếu tồn tại
		if (facultyId && facultyId !== "null") {
			queryBuilder.andWhere('faculty.facultyId = :facultyId', { facultyId });
		}

		// Chọn các cột cần thiết và thêm thông tin liên kết
		queryBuilder
			.select([
				'thesis.thesisId',
				'thesis.thesisName',
				'thesis.startDate',
				'thesis.finishDate',
				'status.statusId',
				'status.statusName',
				'status.color',
				'instructor.userId',
				'instructor.fullname',
				'faculty.facultyId',
				'faculty.facultyName'
			])
			.leftJoin('thesis.status', 'status')
			.leftJoin('thesis.instructor', 'instructor')
			.leftJoin('thesis.thesisGroup', 'thesisGroup')
			.leftJoin('thesisGroup.faculty', 'faculty')
			.leftJoin('thesis.follower', 'follower')
			.leftJoin('follower.followerDetails', 'follower_detail')
			.leftJoin('follower_detail.user', 'followerUser')
			.addSelect(['followerUser.userId', 'followerUser.fullname', 'followerUser.avatar'])
			.leftJoin('thesis.createUser', 'user2')
			.addSelect(['user2.userId'])
			.orderBy('thesis.createDate', 'DESC');

		// Lấy danh sách khóa luận
		const listThesis = await queryBuilder.getMany();

		// Tạo danh sách ID để kiểm tra đăng ký
		const thesisIds = listThesis.map(thesis => thesis.thesisId);

		// Lấy tất cả bản ghi đăng ký liên quan đến danh sách khóa luận và người dùng
		const registrations = await this.thesis_UserRepository.find({
			where: { thesis: { thesisId: In(thesisIds) } },
			relations: ['thesis', 'user']
		});


		// Tạo map để đếm số lượng đăng ký và kiểm tra trạng thái duyệt
		const registrationMap = new Map();
		registrations.forEach(reg => {
			const { thesisId } = reg.thesis;
			const { userId: regUserId } = reg.user;
			const { isApprove } = reg;

			if (!registrationMap.has(thesisId)) {
				registrationMap.set(thesisId, {
					count: 0,
					approveForUser: false
				});
			}

			const data = registrationMap.get(thesisId);
			data.count += 1;
			if (regUserId === userId) {
				data.approveForUser = isApprove;
			}
		});

		// Kết hợp dữ liệu để trả về kết quả cuối cùng
		const result = listThesis.map(thesis => {
			const regData = registrationMap.get(thesis.thesisId) || { count: 0, approveForUser: false };
			return {
				...thesis,
				count: regData.count,
				approveForUser: regData.approveForUser
			};
		});

		return result;
	};



	async importThesis(data: any[], createUserId: string): Promise<Thesis[]> {
		let thesisSaved = [];
		for (const thesis of data) {

			// Kiểm tra và chuyển đổi nhóm đề tài
			if (thesis.thesisGroupId) {
				const entity = await this.thesisGroupRepository.findOne({
					where: { thesisGroupId: thesis.thesisGroupId },
					relations: ['faculty']
				});
				if (!entity) {
					throw new Error('Không có dữ liệu nhóm đề tài');
				}
				thesis.thesisGroup = entity;
				const id = await this.generateNewId(entity?.faculty?.facultyId);
				thesis.thesisId = id;
			}
			else {
				throw new Error('Không có dữ liệu nhóm đề tài');
			}
			// Kiểm tra và chuyển đổi trạng thái
			if (thesis.status) {
				const entity = await this.statusRepository.findOneBy({ statusId: thesis.status });
				if (entity) {
					thesis.status = entity;
				} else {
					thesis.status = null;
				}
			}
			// Kiểm tra và chuyển đổi gv hướng dẫn
			if (thesis.instructorName) {
				const entity = await this.userRepository.findOneBy({ fullname: Like(`%${thesis.instructorName}%`) });
				if (entity) {
					thesis.instructor = entity;
				} else {
					thesis.instructor = null;
				}
			}
			// Kiểm tra và chuyển đổi người tạo
			if (createUserId) {
				const entity = await this.userRepository.findOneBy({ userId: createUserId });
				if (entity) {
					thesis.createUser = entity;
				}
			}

			thesisSaved.push(await this.thesisRepository.save(thesis));
		}
		return thesisSaved;
	}

}

