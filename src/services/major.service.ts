// major.service.ts
import { DataSource, Repository } from 'typeorm';
import { Major } from '../entities/Major';

export class MajorService {
  private majorRepository: Repository<Major>;

  constructor(dataSource: DataSource) {
    this.majorRepository = dataSource.getRepository(Major);
  }

  async create(data: Partial<Major>): Promise<Major> {
    const major = this.majorRepository.create(data);
    return this.majorRepository.save(major);
  }

  async getAll(): Promise<Major[]> {
    return this.majorRepository.find();
  }

  async getById(majorId: string): Promise<Major | null> {
    return this.majorRepository.findOneBy({ majorId });
  }

  async update(majorId: string, data: Partial<Major>): Promise<Major | null> {
    const major = await this.majorRepository.findOneBy({ majorId });
    if (!major) {
      return null;
    }
    this.majorRepository.merge(major, data);
    return this.majorRepository.save(major);
  }

  async delete(majorId: string): Promise<boolean> {
    const result = await this.majorRepository.delete({ majorId });
    return result.affected !== 0;
  }
}