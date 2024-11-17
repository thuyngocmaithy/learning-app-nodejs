// status.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
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
    return this.statusRepository
      .createQueryBuilder("status")
      .orderBy(
        `CASE 
          WHEN status.type = 'Tiến độ nhóm đề tài NCKH' THEN 1
          WHEN status.type = 'Tiến độ đề tài NCKH' THEN 2
          WHEN status.type = 'Tiến độ nhóm đề tài khóa luận' THEN 3          
          WHEN status.type = 'Tiến độ đề tài khóa luận' THEN 4
          ELSE 5
        END`
      )
      .addOrderBy("status.orderNo", "ASC")
      .getMany();
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

  async delete(statusIds: string[]): Promise<boolean> {
    const result = await this.statusRepository.delete({ statusId: In(statusIds) });
    return result.affected !== 0;
  }

  async getByType(type: 'Tiến độ đề tài NCKH' | 'Tiến độ đề tài khóa luận' | 'Tiến độ nhóm đề tài NCKH' | 'Tiến độ nhóm đề tài khóa luận'): Promise<Status[]> {
    return this.statusRepository.find({ where: { type } });
  }

  async getWhere(condition: any): Promise<Status[]> {
    const whereCondition: any = {};
    if (condition.statusId) {
      whereCondition.statusId = condition.statusId;
    }
    if (condition.statusName) {
      whereCondition.statusName = Like(`%${condition.statusName}%`);
    }
    if (condition.type) {
      whereCondition.type = condition.type;
    }
    return this.statusRepository.find({
      where: whereCondition,
    });
  }
}
