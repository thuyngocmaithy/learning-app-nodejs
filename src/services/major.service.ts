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

  async getById(id: string): Promise<Major | null> {
    return this.majorRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<Major>): Promise<Major | null> {
    const major = await this.majorRepository.findOneBy({ id });
    if (!major) {
      return null;
    }
    this.majorRepository.merge(major, data);
    return this.majorRepository.save(major);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.majorRepository.delete({ id });
    return result.affected !== 0;
  }
}