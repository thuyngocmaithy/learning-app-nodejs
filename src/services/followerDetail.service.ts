import { In, Repository } from 'typeorm';
import { Follower, FollowerDetail } from '../entities/Follower';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export class FollowerDetailService {
  private followerDetailRepository: Repository<FollowerDetail>;

  constructor(dataSource: DataSource) {
    this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
  }

  async create(data: Partial<FollowerDetail>): Promise<FollowerDetail> {
    const followerDetail = this.followerDetailRepository.create(data);
    return this.followerDetailRepository.save(followerDetail);
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
