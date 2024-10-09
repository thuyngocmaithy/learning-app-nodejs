import { Repository, DataSource, FindOneOptions, Int32, FindManyOptions, In, FindOptions } from 'typeorm';
import { ScientificResearch_User } from '../entities/ScientificResearch_User'
import { User } from '../entities/User';
import { ScientificResearch } from '../entities/ScientificResearch';
import { FollowerService } from './follower.service';
import { FollowerDetailService } from './followerDetail.service';
import { AppDataSource } from '../data-source';
import { Follower, FollowerDetail } from '../entities/Follower';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';

export class ScientificResearch_UserService {
  private scientificResearchUserRepository: Repository<ScientificResearch_User>;
  private followerDetailRepository: Repository<FollowerDetail>;
  private followerRepository: Repository<Follower>;
  private srgRepository: Repository<ScientificResearchGroup>;
  private userRepository: Repository<User>;
  private srRepository: Repository<ScientificResearch>;
  private followerService: FollowerService;
  private followerDetailService: FollowerDetailService;

  constructor(dataSource: DataSource) {
    this.scientificResearchUserRepository = dataSource.getRepository(ScientificResearch_User);
    this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
    this.followerRepository = dataSource.getRepository(Follower);
    this.srgRepository = dataSource.getRepository(ScientificResearchGroup);
    this.userRepository = dataSource.getRepository(User);
    this.srRepository = dataSource.getRepository(ScientificResearch);
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

  public create = async (scientificResearchUserData: any): Promise<boolean> => {
    const listUser = await this.userRepository.findBy({
      userId: In(scientificResearchUserData.userId)
    });
    if (!listUser) {
      throw new Error('Invalid userId');
    }

    const scientificResearch = await this.srRepository.findOneBy({ scientificResearchId: scientificResearchUserData.scientificResearchId });
    if (!scientificResearch) {
      throw new Error('Invalid scientificResearchId');
    }
    const indexGroup = this.getHighestGroupScientificResearchUser();
    // Lặp qua danh sách scientificResearch và tạo các đối tượng scientificResearchUser
    for (const user of listUser) {
      const scientificResearchUser = this.scientificResearchUserRepository.create({
        scientificResearch: scientificResearch,
        user: user,
        group: listUser.length === 1 ? 0 : await indexGroup + 1,
        isLeader: user.userId === scientificResearchUserData.isLeader,
      });

      // Lưu đối tượng scientificResearchUser 
      await this.scientificResearchUserRepository.save(scientificResearchUser);
    }
    return true
  }

  public update = async (id: string[], scientificResearchUserData: Partial<ScientificResearch_User>): Promise<ScientificResearch_User[] | null> => {
    await this.scientificResearchUserRepository.update(
      { id: In(id) },
      scientificResearchUserData
    );

    const updatedScientificResearchUser = await this.scientificResearchUserRepository.find({
      where: { id: In(id) },
      relations: ['scientificResearch', 'user']
    });

    if (updatedScientificResearchUser) {
      updatedScientificResearchUser.forEach(async (updatedSRU) => {
        // Tìm follower bằng scientificResearchId
        const follower = await this.followerService.getByScientificResearchId(updatedSRU.scientificResearch.scientificResearchId);
        // Nếu đã có follower => Thêm detail
        if (follower) {
          const followerDetail = await this.followerDetailService.findByUserAndFollower(updatedSRU.user, follower);
          if (scientificResearchUserData.isApprove) {
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
          if (scientificResearchUserData.isApprove) {
            updatedScientificResearchUser.forEach(async (updatedSRU) => {
              const newFollower = new Follower();
              newFollower.scientificResearch = updatedSRU.scientificResearch;
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

    return updatedScientificResearchUser;
  }


  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.scientificResearchUserRepository.delete({ id: In(ids) });
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

  async getWhere(condition: any): Promise<ScientificResearch_User[]> {
    const whereCondition: any = {};

    if (condition.userId) {
      whereCondition.user = { userId: condition.userId };
    }
    if (condition.srgroupId) {
      whereCondition.scientificResearch = { scientificResearchGroup: { scientificResearchGroupId: condition.srgroupId } };
    }

    if (condition.srId) {
      whereCondition.scientificResearch = { scientificResearchId: condition.srId };
    }
    if (condition.group) {
      whereCondition.group = condition.group;
    }

    return this.scientificResearchUserRepository.find({
      where: whereCondition,
      relations: [
        'scientificResearch',
        'user',
        'scientificResearch.createUser',
        'scientificResearch.instructor',
        'scientificResearch.lastModifyUser',
        'scientificResearch.follower',
        'scientificResearch.follower.followerDetails',
        'scientificResearch.status',
        'scientificResearch.scientificResearchGroup.faculty'
      ],
    });
  }

  public getByScientificResearch = async (scientificResearch: ScientificResearch): Promise<ScientificResearch_User[] | null> => {
    const options: FindManyOptions<ScientificResearch_User> = {
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
    return this.scientificResearchUserRepository.find(options);
  }

  // Xóa bằng user và scientificResearch
  public deleteByUserAndScientificResearch = async (user: User, scientificResearch: ScientificResearch): Promise<boolean> => {
    const findGroupDel = await this.scientificResearchUserRepository.findOneBy({
      user: { userId: user.userId },
      scientificResearch: { scientificResearchId: scientificResearch.scientificResearchId },
    })

    const result = await this.scientificResearchUserRepository.delete({
      group: findGroupDel?.group
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}