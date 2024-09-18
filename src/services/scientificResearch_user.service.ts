import { Repository, DataSource, FindOneOptions, Int32 } from 'typeorm';
import { ScientificResearch_User } from '../entities/ScientificResearch_User'
import { User } from '../entities/User';
import { ScientificResearch } from '../entities/ScientificResearch';
import { FollowerService } from './follower.service';
import { FollowerDetailService } from './followerDetail.service';
import { AppDataSource } from '../data-source';
import { Follower, FollowerDetail } from '../entities/Follower';

export class ScientificResearch_UserService {
  private scientificResearchUserRepository: Repository<ScientificResearch_User>;
  private followerDetailRepository: Repository<FollowerDetail>;
  private followerRepository: Repository<Follower>;
  private followerService: FollowerService;
  private followerDetailService: FollowerDetailService;

  constructor(dataSource: DataSource) {
    this.scientificResearchUserRepository = dataSource.getRepository(ScientificResearch_User);
    this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
    this.followerRepository = dataSource.getRepository(Follower);
    this.followerService = new FollowerService(AppDataSource);
    this.followerDetailService = new FollowerDetailService(AppDataSource);
  }

  public getAll = async (): Promise<ScientificResearch_User[]> => {
    return this.scientificResearchUserRepository.find({
      relations: ['scientificResearch', 'user']
    });
  }

  public getById = async (id: string): Promise<ScientificResearch_User | null> => {
    const options: FindOneOptions<ScientificResearch_User> = {
      where: { id },
      relations: [
        'scientificResearch',
        'user',
        'scientificResearch.createUser',
        'scientificResearch.instructor',
        'scientificResearch.lastModifyUser',
        'scientificResearch.follower',
        'scientificResearch.follower.followerDetails',
        'scientificResearch.follower.followerDetails.user'
      ]
    };
    return this.scientificResearchUserRepository.findOne(options);
  }

  public create = async (scientificResearchUserData: Partial<ScientificResearch_User>): Promise<ScientificResearch_User> => {
    const scientificResearchUser = this.scientificResearchUserRepository.create(scientificResearchUserData);
    return this.scientificResearchUserRepository.save(scientificResearchUser);
  }

  public update = async (id: string, scientificResearchUserData: Partial<ScientificResearch_User>): Promise<ScientificResearch_User | null> => {
    await this.scientificResearchUserRepository.update(id, scientificResearchUserData);

    const updatedScientificResearchUser = await this.scientificResearchUserRepository.findOne({
      where: { id },
      relations: ['scientificResearch', 'user']
    });

    if (updatedScientificResearchUser) {
      // Tìm follower bằng scientificResearchId
      const follower = await this.followerService.getByScientificResearchId(updatedScientificResearchUser.scientificResearch.scientificResearchId);
      // Nếu đã có follower => Thêm detail
      if (follower) {
        const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedScientificResearchUser.user, follower);
        if (scientificResearchUserData.isApprove) {
          // Thêm người theo dõi
          if (!followerDetail) {
            const newFollowerDetail = new FollowerDetail();
            newFollowerDetail.follower = follower;
            newFollowerDetail.user = updatedScientificResearchUser.user;
            await this.followerDetailRepository.save(newFollowerDetail);
          }
        } else {
          // Xóa người theo dõi
          if (followerDetail) {
            await this.followerDetailRepository.remove(followerDetail);
          }
        }
      }
      // Chưa có follower => Tạo mới follower trước khi thêm detail
      else {
        // Chưa có follower => không xử lý trường hợp Hủy duyệt (isApprove = false)
        // Do Hủy duyệt => Xóa followerDetail nhưng chưa có follower nên không cần xử lý
        if (scientificResearchUserData.isApprove) {
          const newFollower = new Follower();
          newFollower.scientificResearch = updatedScientificResearchUser.scientificResearch;
          const newfollowerCreate = await this.followerRepository.save(newFollower);
          const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedScientificResearchUser.user, newfollowerCreate);

          // Thêm người theo dõi
          if (!followerDetail) {
            const newFollowerDetail = new FollowerDetail();
            newFollowerDetail.follower = newfollowerCreate;
            newFollowerDetail.user = updatedScientificResearchUser.user;
            await this.followerDetailRepository.save(newFollowerDetail);
          }
        }
      }
    }

    return updatedScientificResearchUser;
  }


  public delete = async (id: string): Promise<boolean> => {
    const result = await this.scientificResearchUserRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  public getHighestGroupScientificResearchUser = async (): Promise<number> => {
    const scientificResearchUsers = await this.scientificResearchUserRepository.find({
      order: { group: 'DESC' },  // Sort by `group` in descending order
      relations: ['scientificResearch', 'user'],
      take: 1  // Limit to one result
    });

    // If no rows are found, return 0
    if (!scientificResearchUsers.length) {
      return 0;
    }

    const scientificResearchUser = scientificResearchUsers[0];
    return scientificResearchUser.group || 0;
  }

  public getByUserId = async (user: User): Promise<ScientificResearch_User[]> => {
    const options: FindOneOptions<ScientificResearch_User> = {
      where: { user },
      relations: [
        'scientificResearch',
        'user',
        'scientificResearch.createUser',
        'scientificResearch.instructor',
        'scientificResearch.lastModifyUser',
        'scientificResearch.follower',
        'scientificResearch.follower.followerDetails'
      ]
    };
    return this.scientificResearchUserRepository.find(options);
  }

  public getByScientificResearchId = async (scientificResearch: ScientificResearch): Promise<ScientificResearch_User | null> => {
    const options: FindOneOptions<ScientificResearch_User> = {
      where: { scientificResearch: { scientificResearchId: scientificResearch.scientificResearchId } },
      relations: [
        'scientificResearch',
        'user',
        'scientificResearch.createUser',
        'scientificResearch.instructor',
        'scientificResearch.lastModifyUser',
        'scientificResearch.status',
        'scientificResearch.follower',
        'scientificResearch.follower.followerDetails',
        'scientificResearch.follower.followerDetails.user',
        'scientificResearch.scientificResearchGroup.faculty'
      ]
    };
    return this.scientificResearchUserRepository.findOne(options);
  }

  // Xóa bằng user và scientificResearch
  public deleteByUserAndScientificResearch = async (user: User, scientificResearch: ScientificResearch): Promise<boolean> => {
    const result = await this.scientificResearchUserRepository.delete({
      user,
      scientificResearch
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}