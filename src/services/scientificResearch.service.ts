// scientificResearch.service.ts
import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn, FindManyOptions } from 'typeorm';
import { ScientificResearch } from '../entities/ScientificResearch';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';
import { FollowerService } from './follower.service';
import { AppDataSource } from '../data-source';
import { FollowerDetailService } from './followerDetail.service';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';

export class ScientificResearchService {
  private scientificResearchRepository: Repository<ScientificResearch>;
  private userRepository: Repository<User>;
  private statusRepository: Repository<Status>;
  private scientificResearchGroupRepository: Repository<ScientificResearchGroup>;

  constructor(dataSource: DataSource) {
    this.scientificResearchRepository = dataSource.getRepository(ScientificResearch);
    this.userRepository = dataSource.getRepository(User);
    this.statusRepository = dataSource.getRepository(Status);
    this.scientificResearchGroupRepository = dataSource.getRepository(ScientificResearchGroup);
  }

  async getAll(): Promise<ScientificResearch[]> {
    return this.scientificResearchRepository.find({ relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower'] });
  }

  async getById(scientificResearchId: string): Promise<ScientificResearch | null> {
    return this.scientificResearchRepository.findOne({ where: { scientificResearchId }, relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower'] });
  }

  public create = async (scientificResearchData: any): Promise<ScientificResearch> => {
    const instructor = await this.userRepository.findOne({ where: { userId: scientificResearchData.instructorId } });
    if (!instructor) {
      throw new Error('Invalid instructor ID');
    }

    const status = await this.statusRepository.findOne({ where: { statusId: scientificResearchData.statusId } });
    if (!status) {
      throw new Error('Invalid Status ID');
    }

    const scientificResearchGroup = await this.scientificResearchGroupRepository.findOne({ where: { scientificResearchGroupId: scientificResearchData.scientificResearchGroup } });
    if (!scientificResearchGroup) {
      throw new Error('Invalid ScientificResearchGroups ID');
    }

    const newId = await this.generateNewId(scientificResearchData.facultyId);

    const scientificResearch = this.scientificResearchRepository.create({
      scientificResearchId: newId,
      scientificResearchName: scientificResearchData.scientificResearchName,
      description: scientificResearchData.description,
      executionTime: scientificResearchData.executionTime,
      numberOfMember: scientificResearchData.numberOfMember,
      instructor: instructor,
      status: status,
      createUser: scientificResearchData.createUserId,
      lastModifyUser: scientificResearchData.lastModifyUserId,
      follower: [
        { followerDetails: [{ user: scientificResearchData.createUserId }] }
      ],
      scientificResearchGroup: scientificResearchGroup
    });

    return await this.scientificResearchRepository.save(scientificResearch);
  }

  async update(scientificResearchId: string, data: Partial<ScientificResearch>): Promise<ScientificResearch | null> {
    const scientificResearch = await this.scientificResearchRepository.findOne({ where: { scientificResearchId } });
    if (!scientificResearch) {
      return null;
    }
    this.scientificResearchRepository.merge(scientificResearch, data);
    return this.scientificResearchRepository.save(scientificResearch);
  }

  async delete(scientificResearchId: string): Promise<boolean> {
    const result = await this.scientificResearchRepository.delete({ scientificResearchId });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }


  private generateNewId = async (facultyId: string): Promise<string> => {
    // Find the last thesis for this faculty
    const lastTScientificResearch = await this.scientificResearchRepository.findOne({
      where: { scientificResearchId: Like(`${facultyId}%`) },
      order: { scientificResearchId: 'DESC' }
    });

    let numericPart = 1;
    if (lastTScientificResearch) {
      const match = lastTScientificResearch.scientificResearchId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
      const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

      numericPart = lastNumericPart + 1;
    }
    // Format the new ID
    return `${facultyId}PROJECT${numericPart.toString().padStart(3, '0')}`;
  }

  public getByScientificResearchGroupId = async (scientificResearchGroupId: string): Promise<ScientificResearch[]> => {
    const options: FindManyOptions<ScientificResearch> = {
      where: { scientificResearchGroup: { scientificResearchGroupId } },
      relations: ['status', 'instructor', 'createUser', 'lastModifyUser', 'follower']
    };
    return this.scientificResearchRepository.find(options);
  }
}
