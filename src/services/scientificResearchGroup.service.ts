// scientificResearchGroup.service.ts
import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn, In } from 'typeorm';
import { ScientificResearchGroup } from '../entities/ScientificResearchGroup';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';

export class ScientificResearchGroupService {
  private scientificResearchGroupRepository: Repository<ScientificResearchGroup>;
  private facultyRepository: Repository<Faculty>;
  private userRepository: Repository<User>;
  private statusRepository: Repository<Status>;

  constructor(dataSource: DataSource) {
    this.scientificResearchGroupRepository = dataSource.getRepository(ScientificResearchGroup);
    this.facultyRepository = dataSource.getRepository(Faculty);
    this.userRepository = dataSource.getRepository(User);
    this.statusRepository = dataSource.getRepository(Status);
  }

  async getAll(): Promise<ScientificResearchGroup[]> {
    return this.scientificResearchGroupRepository.find({ relations: ['status', 'faculty', 'createUser', 'lastModifyUser'] });
  }

  async getById(scientificResearchGroupId: string): Promise<ScientificResearchGroup | null> {
    return this.scientificResearchGroupRepository.findOne({ where: { scientificResearchGroupId }, relations: ['status', 'faculty', 'createUser', 'lastModifyUser'] });
  }

  public create = async (scientificResearchGroupData: any): Promise<ScientificResearchGroup> => {
    const faculty = await this.facultyRepository.findOne({ where: { facultyId: scientificResearchGroupData.facultyId } });
    if (!faculty) {
      throw new Error('Invalid Faculty ID');
    }

    const status = await this.statusRepository.findOne({ where: { statusId: scientificResearchGroupData.statusId } });
    if (!status) {
      throw new Error('Invalid Status ID');
    }

    const newId = await this.generateNewId(scientificResearchGroupData.facultyId);

    const scientificResearchGroup = this.scientificResearchGroupRepository.create({
      scientificResearchGroupId: newId,
      scientificResearchGroupName: scientificResearchGroupData.scientificResearchGroupName,
      startYear: scientificResearchGroupData.startYear,
      finishYear: scientificResearchGroupData.finishYear,
      faculty: faculty,
      status: status,
      createUser: scientificResearchGroupData.createUserId,
      lastModifyUser: scientificResearchGroupData.lastModifyUserId,
    });

    return await this.scientificResearchGroupRepository.save(scientificResearchGroup);
  }

  async update(scientificResearchGroupId: string, data: any): Promise<ScientificResearchGroup | null> {
    const SRGUpdate = await this.scientificResearchGroupRepository.findOneBy({ scientificResearchGroupId });
    if (!SRGUpdate) {
      return null;
    }
    const faculty = await this.facultyRepository.findOne({ where: { facultyId: data.facultyId } });
    if (!faculty) {
      throw new Error('Invalid Faculty ID');
    }

    const status = await this.statusRepository.findOne({ where: { statusId: data.statusId } });
    if (!status) {
      throw new Error('Invalid Status ID');
    }


    // Merge dữ liệu mới vào đối tượng đã tìm thấy
    SRGUpdate.scientificResearchGroupName = data.scientificResearchGroupName;
    SRGUpdate.startYear = data.startYear;
    SRGUpdate.finishYear = data.finishYear;
    SRGUpdate.faculty = faculty;
    SRGUpdate.status = status;
    SRGUpdate.lastModifyUser = data.lastModifyUserId;

    return this.scientificResearchGroupRepository.save(SRGUpdate);
  }

  async delete(scientificResearchGroupIds: string[]): Promise<boolean> {
    const result = await this.scientificResearchGroupRepository.delete({ scientificResearchGroupId: In(scientificResearchGroupIds) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }


  private generateNewId = async (facultyId: string): Promise<string> => {
    // Find the last thesis for this faculty
    const lastTScientificResearchGroup = await this.scientificResearchGroupRepository.findOne({
      where: { scientificResearchGroupId: Like(`${facultyId}%`) },
      order: { scientificResearchGroupId: 'DESC' }
    });

    let numericPart = 1;
    if (lastTScientificResearchGroup) {
      const match = lastTScientificResearchGroup.scientificResearchGroupId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
      const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

      numericPart = lastNumericPart + 1;
    }

    // Format the new ID
    return `${facultyId}RTG${numericPart.toString().padStart(3, '0')}`;
  }

  async getWhere(condition: Partial<ScientificResearchGroup>): Promise<ScientificResearchGroup[]> {
    const whereCondition: any = {};

    if (condition.faculty) {
      whereCondition.faculty = { facultyId: condition.faculty }
    }

    if (condition.scientificResearchGroupId) {
      whereCondition.scientificResearchGroupId = Like(`%${condition.scientificResearchGroupId}%`);
    }

    return this.scientificResearchGroupRepository.find({
      where: whereCondition,
      relations: ['status', 'faculty', 'createUser', 'lastModifyUser']
    });
  }
}
