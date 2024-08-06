// status.service.ts
import { DataSource, Repository } from 'typeorm';
import { Status } from '../entities/Status';

export class StatusService {
  private statusRepository: Repository<Status>;

  constructor(dataSource: DataSource) {
    this.statusRepository = dataSource.getRepository(Status);
  }

  async create(data: Partial<Status>): Promise<Status> {
    const status = this.statusRepository.create(data);
    return this.statusRepository.save(status);
  }

  async getAll(): Promise<Status[]> {
    return this.statusRepository.find();
  }

  async getById(id: string): Promise<Status | null> {
    return this.statusRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<Status>): Promise<Status | null> {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) {
      return null;
    }
    this.statusRepository.merge(status, data);
    return this.statusRepository.save(status);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.statusRepository.delete({ id });
    return result.affected !== 0;
  }
}