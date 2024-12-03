import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { Thesis } from '../entities/Thesis';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';
import { AppDataSource } from '../data-source';
import { ThesisGroup } from '../entities/ThesisGroup';
import { Thesis_User } from '../entities/Thesis_User';

export class ThesisService {
	private thesisRepository: Repository<Thesis>;
	private thesis_UserRepository: Repository<Thesis_User>;
	private userRepository: Repository<User>;
	private statusRepository: Repository<Status>;
	private thesisGroupRepository: Repository<ThesisGroup>;
	private facultyRepository: Repository<Faculty>;

	constructor(dataSource: DataSource) {
		this.thesisRepository = dataSource.getRepository(Thesis);
		this.thesis_UserRepository = dataSource.getRepository(Thesis_User);
		this.userRepository = dataSource.getRepository(User);
		this.statusRepository = dataSource.getRepository(Status);
		this.thesisGroupRepository = dataSource.getRepository(ThesisGroup);
		this.facultyRepository = dataSource.getRepository(Faculty);
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
			.leftJoin('thesis.instructor', 'user')
			.addSelect(['user.userId', 'user.fullname']);

		queryBuilder
			.leftJoin('thesis.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder.orderBy("thesis.createDate", 'DESC');
		return queryBuilder.getMany();
	}

	async getById(thesisId: string): Promise<Thesis | null> {
		return this.thesisRepository.findOne({
			where: { thesisId },
			relations: [
				'status',
				'instructor',
				'createUser',
				'lastModifyUser',
				'follower',
				'follower.followerDetails',
				'follower.followerDetails.user',
				'thesisGroup.faculty',
				'thesisGroup'
			]
		});
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

		const status = await this.statusRepository.findOne({ where: { statusId: thesisData.statusId } });
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

		return this.thesisRepository.find({
			order: { createDate: 'DESC' },
			where: whereCondition,
			relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower'],
		});
	}


	async getListThesisJoined(condition: any): Promise<Thesis[]> {
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		if (condition.instructorId && condition.instructorId !== 'undefined') {
			queryBuilder.andWhere('thesis.instructorId = :instructorId', {
				instructorId: condition.instructorId
			});
		}

		if (condition.thesisGroup && condition.thesisGroup !== 'undefined') {
			queryBuilder.andWhere('thesis.thesisGroup = :thesisGroup', {
				thesisGroup: condition.thesisGroup
			});
		}
		queryBuilder.select([
			'thesis.thesisId',
			'thesis.thesisName',
			'thesis.startDate',
			'thesis.finishDate'
		]);
		queryBuilder
			.leftJoin('thesis.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('thesis.instructor', 'user')
			.addSelect(['user.userId', 'user.fullname']);

		queryBuilder.orderBy('thesis.createDate', 'DESC');

		return queryBuilder.getMany();
	}

	public getByThesisGroupIdAndCheckApprove = async (thesisGroupId: string, userId: string): Promise<any[]> => {
		const queryBuilder = this.thesisRepository.createQueryBuilder('thesis');

		if (thesisGroupId && thesisGroupId !== "null") {
			queryBuilder.andWhere(
				'thesis.thesisGroupId = :thesisGroupId ' +
				'thesis.isDisable = false', {
				thesisGroupId: thesisGroupId
			});
		}
		else {
			queryBuilder.andWhere('thesis.isDisable = false');
		}

		queryBuilder.select([
			'thesis.thesisId',
			'thesis.thesisName',
			'thesis.startDate',
			'thesis.finishDate'
		]);
		queryBuilder
			.leftJoin('thesis.status', 'status')
			.addSelect(['status.statusId', 'status.statusName', 'status.color']);

		queryBuilder
			.leftJoin('thesis.instructor', 'instructor')
			.addSelect(['instructor.userId', 'instructor.fullname']);

		queryBuilder
			.leftJoin('thesis.thesisGroup', 'thesisGroup')
			.leftJoin('thesisGroup.faculty', 'faculty')
			.addSelect(['faculty.facultyId', 'faculty.facultyName']);


		queryBuilder
			.leftJoin('thesis.follower', 'follower')
			.leftJoin('follower.followerDetails', 'follower_detail')
			.leftJoin('follower_detail.user', 'followerUser')
			.addSelect(['followerUser.userId', 'followerUser.fullname', 'followerUser.avatar']);


		queryBuilder.orderBy('thesis.createDate', 'DESC');

		const listThesis = await queryBuilder.getMany();


		const promises = listThesis.map(async (thesis) => {
			const responseCountRegister = await this.thesis_UserRepository.findBy({ thesis: { thesisId: thesis.thesisId } });
			const count = responseCountRegister.length;

			const responseUserRegister = await this.thesis_UserRepository.findOneBy(
				{
					thesis: { thesisId: thesis.thesisId },
					user: { userId: userId }
				}
			);
			const approve = responseUserRegister?.isApprove;

			return { ...thesis, count, approve };
		});

		// Đợi tất cả các Promise hoàn thành
		const result = await Promise.all(promises);

		return result;
	}


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

