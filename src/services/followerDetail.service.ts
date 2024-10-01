import { In, Repository } from 'typeorm';
import { Follower, FollowerDetail } from '../entities/Follower';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { ScientificResearch } from '../entities/ScientificResearch';

export class FollowerDetailService {
  private followerDetailRepository: Repository<FollowerDetail>;
  private followerRepository: Repository<Follower>;
  private userRepository: Repository<User>;
  private SRRepository: Repository<ScientificResearch>;

  constructor(dataSource: DataSource) {
    this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
    this.followerRepository = dataSource.getRepository(Follower);
    this.userRepository = dataSource.getRepository(User);
    this.SRRepository = dataSource.getRepository(ScientificResearch);
  }

  async create(data: any): Promise<FollowerDetail> {
    let follower = await this.followerRepository.findOne({ where: { scientificResearch: { scientificResearchId: data.scientificResearchId } } });
    const scientificResearch = await this.SRRepository.findOneBy({ scientificResearchId: data.scientificResearchId });

    if (!follower && scientificResearch) {
      const newFollower = new Follower();
      newFollower.scientificResearch = scientificResearch;
      follower = await this.followerRepository.save(newFollower);
    }
    if (!follower) {
      throw new Error('Follower not found');
    }

    const user = await this.userRepository.findOne({ where: { userId: data.userId } });
    if (!user) {
      throw new Error('Invalid user ID');
    }

    const followerDetail = this.followerDetailRepository.create({
      follower: follower,
      user: user
    });

    return await this.followerDetailRepository.save(followerDetail);
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
  public findByUserAndFollower = async (user: User, follower: Follower): Promise<FollowerDetail | null> => {
    return this.followerDetailRepository.findOne({
      where: {
        user: user,
        follower: follower
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
