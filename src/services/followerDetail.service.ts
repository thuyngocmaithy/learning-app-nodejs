import { In, Repository } from 'typeorm';
import { Follower, FollowerDetail } from '../entities/Follower';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { ScientificResearch } from '../entities/ScientificResearch';
import { Thesis } from '../entities/Thesis';

export class FollowerDetailService {
	private followerDetailRepository: Repository<FollowerDetail>;
	private followerRepository: Repository<Follower>;
	private userRepository: Repository<User>;
	private SRRepository: Repository<ScientificResearch>;
	private thesisRepository: Repository<Thesis>;

	constructor(dataSource: DataSource) {
		this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
		this.followerRepository = dataSource.getRepository(Follower);
		this.userRepository = dataSource.getRepository(User);
		this.SRRepository = dataSource.getRepository(ScientificResearch);
		this.thesisRepository = dataSource.getRepository(Thesis);
	}

	async create(data: any): Promise<FollowerDetail[]> {
		let follower;

		// Xử lý nếu có scientificResearchId
		if (data.scientificResearchId) {
			// Tìm hoặc tạo mới follower dựa trên scientificResearchId
			const scientificResearch = await this.SRRepository.findOneBy({
				scientificResearchId: data.scientificResearchId,
			});

			if (!scientificResearch) {
				throw new Error('ScientificResearch không tồn tại');
			}

			follower = await this.followerRepository.findOne({
				where: { scientificResearch: { scientificResearchId: data.scientificResearchId } },
			});

			if (!follower) {
				const newFollower = new Follower();
				newFollower.scientificResearch = scientificResearch;
				follower = await this.followerRepository.save(newFollower);
			}
		}

		// Xử lý nếu có thesisId
		if (data.thesisId) {
			// Tìm hoặc tạo mới follower dựa trên thesisId
			const thesis = await this.thesisRepository.findOneBy({
				thesisId: data.thesisId,
			});

			if (!thesis) {
				throw new Error('Thesis không tồn tại');
			}

			follower = await this.followerRepository.findOne({
				where: { thesis: { thesisId: data.thesisId } },
			});

			if (!follower) {
				const newFollower = new Follower();
				newFollower.thesis = thesis;
				follower = await this.followerRepository.save(newFollower);
			}
		}

		// Nếu không tìm thấy follower nào, ném lỗi
		if (!follower) {
			throw new Error('Follower không tồn tại');
		}

		// Kiểm tra userId
		if (!data.userId || !Array.isArray(data.userId) || data.userId.length === 0) {
			throw new Error('Phải cung cấp userId dạng mảng');
		}

		// Tìm tất cả userId trong một truy vấn
		const users = await this.userRepository.find({
			where: {
				userId: In(data.userId)
			}
		});

		// Xác định các userId không tồn tại
		const foundUserIds = new Set(users.map((user) => user.userId));
		const invalidUserIds = data.userId.filter((userId: any) => !foundUserIds.has(userId));

		if (invalidUserIds.length > 0) {
			throw new Error(`Các userId không hợp lệ: ${invalidUserIds.join(', ')}`);
		}

		// Tạo danh sách FollowerDetail
		const followerDetails = data.userId.map((userId: any) => {
			const user = users.find((u) => u.userId === userId);
			return this.followerDetailRepository.create({
				follower: follower,
				user: user!,
			});
		});

		// Lưu tất cả FollowerDetail vào cơ sở dữ liệu trong một lần
		return await this.followerDetailRepository.save(followerDetails);
	}


	async getAll(): Promise<FollowerDetail[]> {
		return this.followerDetailRepository.find({ relations: ['follower', 'user'] });
	}

	async getById(id: string): Promise<FollowerDetail | null> {
		return this.followerDetailRepository.findOne({ where: { id }, relations: ['follower', 'user'] });
	}

	async update(id: string, data: Partial<FollowerDetail>): Promise<FollowerDetail | null> {
		const followerDetail = await this.followerDetailRepository.findOne({ where: { id } });
		if (!followerDetail) return null;
		this.followerDetailRepository.merge(followerDetail, data);
		return this.followerDetailRepository.save(followerDetail);
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.followerDetailRepository.delete({ id: In(ids) });
		return result.affected !== 0;
	}

	async deleteBySRIdAndUserId(scientificResearchId: string, userId: string): Promise<boolean> {
		const follower = await this.followerRepository.findOneBy({ scientificResearch: { scientificResearchId: scientificResearchId } })
		const user = await this.userRepository.findOneBy({ userId: userId });
		const followerDetailDel = await this.followerDetailRepository.findOneBy({
			follower: { id: follower?.id },
			user: { userId: user?.userId }
		})
		const result = await this.followerDetailRepository.delete({ id: followerDetailDel?.id });
		return result.affected !== 0;
	}

	async deleteByThesisIdAndUserId(thesisId: string, userId: string): Promise<boolean> {
		const follower = await this.followerRepository.findOneBy({ thesis: { thesisId: thesisId } })
		const user = await this.userRepository.findOneBy({ userId: userId });
		const followerDetailDel = await this.followerDetailRepository.findOneBy({
			follower: { id: follower?.id },
			user: { userId: user?.userId }
		})
		const result = await this.followerDetailRepository.delete({ id: followerDetailDel?.id });
		return result.affected !== 0;
	}

	public findByUserAndFollower = async (user: User, follower: Follower): Promise<FollowerDetail | null> => {
		return this.followerDetailRepository.findOne({
			where: {
				user: { userId: user.userId },
				follower: { id: follower.id }
			}
		});
	};

	/**
	 * Lấy danh sách FollowerDetail theo user
	 */
	public async getDetailsByUser(user: User): Promise<FollowerDetail[]> {
		return this.followerDetailRepository.find({
			where: {
				user: { userId: user.userId }
			},
			relations: ['follower']
		});
	}
}
