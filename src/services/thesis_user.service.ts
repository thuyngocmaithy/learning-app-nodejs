import { Repository, DataSource, FindOneOptions, Int32, FindManyOptions, In, FindOptions } from 'typeorm';
import { Thesis_User } from '../entities/Thesis_User'
import { User } from '../entities/User';
import { Thesis } from '../entities/Thesis';
import { FollowerService } from './follower.service';
import { FollowerDetailService } from './followerDetail.service';
import { AppDataSource } from '../data-source';
import { Follower, FollowerDetail } from '../entities/Follower';

export class Thesis_UserService {
	private thesisUserRepository: Repository<Thesis_User>;
	private followerDetailRepository: Repository<FollowerDetail>;
	private followerRepository: Repository<Follower>;
	private userRepository: Repository<User>;
	private srRepository: Repository<Thesis>;
	private followerService: FollowerService;
	private followerDetailService: FollowerDetailService;

	constructor(dataSource: DataSource) {
		this.thesisUserRepository = dataSource.getRepository(Thesis_User);
		this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
		this.followerRepository = dataSource.getRepository(Follower);
		this.userRepository = dataSource.getRepository(User);
		this.srRepository = dataSource.getRepository(Thesis);
		this.followerService = new FollowerService(AppDataSource);
		this.followerDetailService = new FollowerDetailService(AppDataSource);

	}

	public getAll = async (): Promise<Thesis_User[]> => {
		return this.thesisUserRepository.find({
			relations: ['thesis', 'user']
		});
	}

	public getById = async (id: string): Promise<Thesis_User | null> => {
		const options: FindOneOptions<Thesis_User> = {
			where: { id },
			relations: [
				'thesis',
				'user',
				'thesis.createUser',
				'thesis.instructor',
				'thesis.lastModifyUser',
				'thesis.follower',
				'thesis.follower.followerDetails',
				'thesis.follower.followerDetails.user'
			]
		};
		return this.thesisUserRepository.findOne(options);
	}

	public create = async (thesisUserData: any): Promise<boolean> => {
		const listUser = await this.userRepository.findBy({
			userId: In(thesisUserData.userId)
		});
		if (!listUser) {
			throw new Error('Invalid userId');
		}

		const thesis = await this.srRepository.findOneBy({ thesisId: thesisUserData.thesisId });
		if (!thesis) {
			throw new Error('Invalid thesisId');
		}
		const indexGroup = this.getHighestGroupThesisUser();
		// Lặp qua danh sách thesis và tạo các đối tượng thesisUser
		for (const user of listUser) {
			const thesisUser = this.thesisUserRepository.create({
				thesis: thesis,
				user: user,
				group: listUser.length === 1 ? 0 : await indexGroup + 1,
				isLeader: user.userId === thesisUserData.isLeader,
			});

			// Lưu đối tượng thesisUser 
			await this.thesisUserRepository.save(thesisUser);
		}
		return true
	}

	public update = async (id: string[], thesisUserData: Partial<Thesis_User>): Promise<Thesis_User[] | null> => {
		await this.thesisUserRepository.update(
			{ id: In(id) },
			thesisUserData
		);

		const updatedThesisUser = await this.thesisUserRepository.find({
			where: { id: In(id) },
			relations: ['thesis', 'user']
		});

		if (updatedThesisUser) {
			updatedThesisUser.forEach(async (updatedSRU) => {
				// Tìm follower bằng thesisId
				const follower = await this.followerService.getByThesisId(updatedSRU.thesis.thesisId);
				// Nếu đã có follower => Thêm detail
				if (follower) {
					const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedSRU.user, follower);
					if (thesisUserData.isApprove) {
						// Thêm người theo dõi
						if (!followerDetail) {
							const newFollowerDetail = new FollowerDetail();
							newFollowerDetail.follower = follower;
							newFollowerDetail.user = updatedSRU.user;
							await this.followerDetailRepository.save(newFollowerDetail);
						}
					} else {
						// Xóa người theo dõi
						if (followerDetail) {
							await this.followerDetailRepository.remove(followerDetail);
						}
					}
				}
				else {
					// Chưa có follower => Tạo mới follower trước khi thêm detail
					// Chưa có follower => không xử lý trường hợp Hủy duyệt (isApprove = false)
					// Do Hủy duyệt => Xóa followerDetail nhưng chưa có follower nên không cần xử lý
					if (thesisUserData.isApprove) {
						updatedThesisUser.forEach(async (updatedSRU) => {
							const newFollower = new Follower();
							newFollower.thesis = updatedSRU.thesis;
							const newfollowerCreate = await this.followerRepository.save(newFollower);
							const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedSRU.user, newfollowerCreate);

							// Thêm người theo dõi
							if (!followerDetail) {
								const newFollowerDetail = new FollowerDetail();
								newFollowerDetail.follower = newfollowerCreate;
								newFollowerDetail.user = updatedSRU.user;
								await this.followerDetailRepository.save(newFollowerDetail);
							}
						})
					}
				}
			})
		}

		return updatedThesisUser;
	}


	public delete = async (ids: string[]): Promise<boolean> => {
		const result = await this.thesisUserRepository.delete({ id: In(ids) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}

	public getHighestGroupThesisUser = async (): Promise<number> => {
		const thesisUsers = await this.thesisUserRepository.find({
			order: { group: 'DESC' },  // Sort by `group` in descending order
			relations: ['thesis', 'user'],
			take: 1  // Limit to one result
		});

		// If no rows are found, return 0
		if (!thesisUsers.length) {
			return 0;
		}

		const thesisUser = thesisUsers[0];
		return thesisUser.group || 0;
	}

	async getWhere(condition: any): Promise<Thesis_User[]> {
		const whereCondition: any = {};

		if (condition.userId) {
			whereCondition.user = { userId: condition.userId };
		}
		if (condition.srgroupId && condition.srgroupId !== "null") {
			whereCondition.thesis = { thesisGroup: { thesisGroupId: condition.srgroupId } };
		}

		if (condition.srId) {
			whereCondition.thesis = { thesisId: condition.srId };
		}
		if (condition.group) {
			whereCondition.group = condition.group;
		}

		return this.thesisUserRepository.find({
			where: whereCondition,
			relations: [
				'thesis',
				'user',
				'thesis.createUser',
				'thesis.instructor',
				'thesis.lastModifyUser',
				'thesis.follower',
				'thesis.follower.followerDetails',
				'thesis.status',
				'thesis.thesisGroup.faculty'
			],
		});
	}

	public getByThesis = async (thesis: Thesis): Promise<Thesis_User[] | null> => {
		const options: FindManyOptions<Thesis_User> = {
			where: { thesis: { thesisId: thesis.thesisId } },
			relations: [
				'thesis',
				'user',
				'thesis.createUser',
				'thesis.instructor',
				'thesis.lastModifyUser',
				'thesis.status',
				'thesis.follower',
				'thesis.follower.followerDetails',
				'thesis.follower.followerDetails.user',
				'thesis.thesisGroup.faculty'
			]
		};
		return this.thesisUserRepository.find(options);
	}

	// Xóa bằng user và thesis
	public deleteByUserAndThesis = async (user: User, thesis: Thesis): Promise<boolean> => {
		const findGroupDel = await this.thesisUserRepository.findOneBy({
			user: { userId: user.userId },
			thesis: { thesisId: thesis.thesisId },
		})

		const result = await this.thesisUserRepository.delete({
			group: findGroupDel?.group
		});
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}

	// Lấy danh sách số lượng đk
	public getByListThesisId = async (ids: string[]): Promise<Thesis_User[] | null> => {
		const queryBuilder = this.thesisUserRepository.createQueryBuilder('tu');

		queryBuilder.andWhere('tu.thesisId IN(:thesisId)', {
			thesisId: ids
		});

		queryBuilder.select([
			'tu.id',
			'tu.group',
			'tu.isLeader',
			'tu.isApprove',
		]);
		queryBuilder
			.leftJoin('tu.user', 'user')
			.addSelect(['user.userId', 'user.fullname', 'user.avatar', 'user.GPA']);

		queryBuilder
			.leftJoin('tu.thesis', 'thesis')
			.addSelect(['thesis.thesisId']);


		return queryBuilder.getMany();
	};
}