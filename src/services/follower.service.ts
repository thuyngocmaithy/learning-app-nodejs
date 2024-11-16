// src/services/follower.service.ts
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { Follower, FollowerDetail } from '../entities/Follower';
import { DataSource } from 'typeorm';
import { ScientificResearch } from '../entities/ScientificResearch';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { User } from '../entities/User';

export class FollowerService {
  private followerRepository: Repository<Follower>;
  private userRepository: Repository<User>;
  private srgRepository: Repository<ScientificResearchGroup>;
  private followerDetailRepository: Repository<FollowerDetail>;

  constructor(dataSource: DataSource) {
    this.followerRepository = dataSource.getRepository(Follower);
    this.userRepository = dataSource.getRepository(User);
    this.srgRepository = dataSource.getRepository(ScientificResearchGroup);
    this.followerDetailRepository = dataSource.getRepository(FollowerDetail);
  }

  async create(data: Partial<Follower>): Promise<Follower> {
    const follower = this.followerRepository.create(data);
    return this.followerRepository.save(follower);
  }

  async getAll(): Promise<Follower[]> {
    return this.followerRepository.find({ relations: ['scientificResearch'] });
  }

  async getById(id: string): Promise<Follower | null> {
    return this.followerRepository.findOne({ where: { id }, relations: ['scientificResearch'] });
  }


  async update(id: string, data: Partial<Follower>): Promise<Follower | null> {
    const follower = await this.followerRepository.findOne({ where: { id } });
    if (!follower) return null;
    this.followerRepository.merge(follower, data);
    return this.followerRepository.save(follower);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.followerRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }

  public getByScientificResearchId = async (scientificResearchId: string): Promise<Follower | null> => {
    const options: FindOneOptions<Follower> = {
      where: { scientificResearch: { scientificResearchId } },
      relations: ['scientificResearch', 'followerDetails']
    };
    return this.followerRepository.findOne(options);
  }

  public getByThesisId = async (thesisId: string): Promise<Follower | null> => {
    const options: FindOneOptions<Follower> = {
      where: { thesis: { thesisId } },
      relations: ['thesis', 'followerDetails']
    };
    return this.followerRepository.findOne(options);
  }

  public getByUserId = async (userId: string): Promise<Follower[] | null> => {
    const options: FindManyOptions<FollowerDetail> = {
      where: { user: { userId: userId } },
      relations: ["follower"],
    };

    // Lấy danh sách các FollowerDetail theo userId
    const followerDetailList = await this.followerDetailRepository.find(options);

    if (!followerDetailList.length) {
      return null; // Trả về null nếu không có follower nào
    }

    // Lấy danh sách followerId từ các FollowerDetail và loại bỏ các followerId bị lặp lại
    const followerIds = [...new Set(followerDetailList.map(detail => detail.follower?.id))];

    // Tìm các Follower dựa trên followerIds
    return this.followerRepository.find({
      where: { id: In(followerIds) },
      relations: ['scientificResearch', 'thesis']
    });
  }


  public getFollowersByUserIdAndSRGroupId = async (userId: string, SRGroupId: string | null): Promise<Follower[] | null> => {
    let user = null;
    let SRGroup = null;

    if (userId) {
      user = await this.userRepository.findOneBy({ userId: userId as string });
    }
    if (SRGroupId) {
      SRGroup = await this.srgRepository.findOneBy({ scientificResearchGroupId: SRGroupId as string });
    }

    let followerDetail = null;
    let followers = null;


    if (user) {
      // Lấy danh sách FollowerDetail dựa trên user
      followerDetail = await this.followerDetailRepository.findBy({ user: user });

      if (followerDetail && followerDetail.length > 0) {
        // Lấy danh sách followerId từ followerDetail
        const followerIds = followerDetail.map(detail => detail.follower.id);

        // Lấy danh sách follower theo danh sách followerIds
        const options: FindManyOptions<Follower> = {
          where: {
            id: In(followerIds),
            ...(SRGroup && {
              scientificResearch: {
                scientificResearchGroup: { scientificResearchGroupId: SRGroup.scientificResearchGroupId }
              }
            })
          },
          relations: ['scientificResearch', 'followerDetails', 'scientificResearch.status', 'thesis', 'thesis.status']
        };
        return this.followerRepository.find(options);
      }
    }
    return null;
  }
}

