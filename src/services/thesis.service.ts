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

		queryBuilder.orderBy('thesis.createDate', 'ASC');
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

		queryBuilder.orderBy('thesis.createDate', 'ASC');

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


		queryBuilder.orderBy('thesis.createDate', 'ASC');

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


	async importThesis(data: any[], createUserId: string): Promise<void> {
		// Kiểm tra createUserId hợp lệ
		const createUser = await this.userRepository.findOne({ where: { userId: createUserId } });
		if (!createUser) {
			throw new Error(`Không tìm thấy người dùng với ID: ${createUserId}`);
		}

		const thesisToSave = await Promise.all(
			data.map(async (thesisData) => {
				const thesisId = thesisData[0];
				const thesisName = thesisData[1];
				const thesisGroupName = thesisData[2];
				const fullname = thesisData[3]; // tên người hướng dẫn
				const numberOfMember = thesisData[4];
				const statusName = thesisData[5];
				const description = thesisData[6];
				const startDate = new Date(thesisData[7]);
				const finishDate = new Date(thesisData[8]);


				// Tìm statusId từ statusName
				const status = await this.statusRepository.findOne({ where: { statusName: thesisData.statusName } });
				if (!status) {
					throw new Error(`Không tìm thấy trạng thái với tên: ${statusName}`);
				}
				const statusId = status.statusId;

				// Tìm userId từ userfullname
				const user = await this.userRepository.findOne({ where: { fullname } });
				if (!user) {
					throw new Error(`Không tìm thấy người hướng dẫn: ${fullname}`);
				}
				const userId = user.userId;


				const thesisGroup = await this.thesisGroupRepository.findOne({ where: { thesisGroupName } });
				if (!thesisGroup) {
					throw new Error(`Không tìm thấy người hướng dẫn: ${thesisGroupName}`);
				}
				const thesisGroupId = thesisGroup?.thesisGroupId;


				// Kiểm tra xem đề tài đã tồn tại chưa
				const existingThesis = await this.thesisRepository.findOne({
					where: { thesisId },
				});

				if (existingThesis) {
					// Nếu đã tồn tại, cập nhật thông tin nhóm đề tài
					existingThesis.thesisName = thesisName;
					existingThesis.status = status;
					existingThesis.instructor = user;
					existingThesis.numberOfMember = numberOfMember;
					existingThesis.description = description;
					existingThesis.startDate = new Date(startDate);
					existingThesis.finishDate = new Date(finishDate);
					existingThesis.lastModifyUser = createUser;

					existingThesis.lastModifyDate = new Date();
					if (thesisGroup)
						existingThesis.thesisGroup = thesisGroup;

					return existingThesis;
				} else {
					// Nếu chưa tồn tại, tạo nhóm đề tài mới
					const thesis = new Thesis();
					thesis.thesisId = thesisId || '';
					thesis.thesisName = thesisName;
					thesis.status = status;
					thesis.numberOfMember = numberOfMember;
					thesis.startDate = new Date(startDate);
					thesis.finishDate = new Date(finishDate);
					thesis.description = description;
					thesis.instructor = user;
					thesis.createUser = createUser;
					thesis.lastModifyUser = createUser;

					if (thesisGroup)
						thesis.thesisGroup = thesisGroup;


					return thesis;
				}
			})
		);

		// Lưu danh sách đề tài vào database
		await this.thesisRepository.save(thesisToSave);
	}

}

