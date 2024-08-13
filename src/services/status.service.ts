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

  async getById(statusId: string): Promise<Status | null> {
    return this.statusRepository.findOneBy({ statusId });
  }

  async update(statusId: string, data: Partial<Status>): Promise<Status | null> {
    const status = await this.statusRepository.findOneBy({ statusId });
    if (!status) {
      return null;
    }
    this.statusRepository.merge(status, data);
    return this.statusRepository.save(status);
  }

  async delete(statusId: string): Promise<boolean> {
    const result = await this.statusRepository.delete({ statusId });
    return result.affected !== 0;
  }
}