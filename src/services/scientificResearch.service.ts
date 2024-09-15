// scientificResearch.service.ts
import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn } from 'typeorm';
import { ScientificResearch } from '../entities/ScientificResearch';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';
import { FollowerService } from './follower.service';
import { AppDataSource } from '../data-source';
import { FollowerDetailService } from './followerDetail.service';

export class ScientificResearchService {
  private scientificResearchRepository: Repository<ScientificResearch>;
  private facultyRepository: Repository<Faculty>;
  private userRepository: Repository<User>;
  private statusRepository: Repository<Status>;

  constructor(dataSource: DataSource) {
    this.scientificResearchRepository = dataSource.getRepository(ScientificResearch);
    this.facultyRepository = dataSource.getRepository(Faculty);
    this.userRepository = dataSource.getRepository(User);
    this.statusRepository = dataSource.getRepository(Status);
  }

  async getAll(): Promise<ScientificResearch[]> {
    return this.scientificResearchRepository.find({ relations: ['status', 'faculty', 'instructor', 'createUser', 'lastModifyUser', 'follower'] });
  }

  async getById(scientificResearchId: string): Promise<ScientificResearch | null> {
    return this.scientificResearchRepository.findOne({ where: { scientificResearchId }, relations: ['status', 'faculty', 'instructor', 'createUser', 'lastModifyUser', 'follower'] });
  }

  public create = async (scientificResearchData: any): Promise<ScientificResearch> => {
    if (!scientificResearchData.instructorId) {
      throw new Error('instructor ID is required');
    }
    if (!scientificResearchData.facultyId) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepository.findOne({ where: { facultyId: scientificResearchData.facultyId } });
    if (!faculty) {
      throw new Error('Invalid Faculty ID');
    }

    const instructor = await this.userRepository.findOne({ where: { userId: scientificResearchData.instructorId } });
    if (!instructor) {
      throw new Error('Invalid instructor ID');
    }

    const status = await this.statusRepository.findOne({ where: { statusId: scientificResearchData.statusId } });
    if (!status) {
      throw new Error('Invalid Status ID');
    }

    const newId = await this.generateNewId(scientificResearchData.facultyId);

    const scientificResearch = this.scientificResearchRepository.create({
      scientificResearchId: newId,
      scientificResearchName: scientificResearchData.scientificResearchName,
      description: scientificResearchData.description,
      executionTime: scientificResearchData.executionTime,
      numberOfMember: scientificResearchData.numberOfMember,
      faculty: faculty,
      instructor: instructor,
      status: status,
      createUser: scientificResearchData.createUserId,
      lastModifyUser: scientificResearchData.lastModifyUserId,
      follower: [
        { followerDetails: [{ user: scientificResearchData.createUserId }] }
      ]
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
      console.log('Last numeric part:', lastNumericPart);

      numericPart = lastNumericPart + 1;
    }

    // Format the new ID
    return `${facultyId}PROJECT${numericPart.toString().padStart(3, '0')}`;
  }

}
