// status.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
import { Status } from '../entities/Status';

export class StatusService {
  private statusRepository: Repository<Status>;

  constructor(dataSource: DataSource) {
    this.statusRepository = dataSource.getRepository(Status);
  }

  async getMaxOrderNoByType(type: 'Tiến độ đề tài NCKH' | 'Tiến độ khóa luận' | 'Tiến độ nhóm đề tài NCKH'): Promise<number> {
    const result = await this.statusRepository
      .createQueryBuilder("status")
      .select("MAX(status.orderNo)", "maxOrderNo")
      .where("status.type = :type", { type })
      .getRawOne();

    return result?.maxOrderNo ?? 0;
  }

  async create(data: Partial<Status>): Promise<Status> {
    const maxOrderNo = await this.getMaxOrderNoByType(data.type as Status["type"]);
    data.orderNo = maxOrderNo + 1;

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

  async delete(statusIds: string[]): Promise<boolean> {
    const result = await this.statusRepository.delete({ statusId: In(statusIds) });
    return result.affected !== 0;
  }

  async getByType(type: 'Tiến độ đề tài NCKH' | 'Tiến độ khóa luận' | 'Tiến độ nhóm đề tài NCKH'): Promise<Status[]> {
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