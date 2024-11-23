import { DataSource, In, Repository } from 'typeorm';
import { Cycle } from '../entities/Cycle';

export class CycleService {
  private cycleRepository: Repository<Cycle>;

  constructor(dataSource: DataSource) {
    this.cycleRepository = dataSource.getRepository(Cycle);
  }

  async create(data: Partial<Cycle>): Promise<Cycle> {
    data = {
      ...data,
      cycleId: `CYCLE${String(data.startYear).slice(-2)}${String(data.endYear).slice(-2)}`
    }
    const cycle = this.cycleRepository.create(data);
    return this.cycleRepository.save(cycle);
  }

  async getAll(): Promise<Cycle[]> {
    return this.cycleRepository.find({
      order: {
        cycleId: 'ASC',
      },
    });
  }

  async getById(id: string): Promise<Cycle | null> {
    return this.cycleRepository.findOne({ where: { cycleId: id } });
  }

  async update(id: string, data: Partial<Cycle>): Promise<Cycle | null> {
    const cycle = await this.cycleRepository.findOne({ where: { cycleId: id } });
    if (!cycle) {
      return null;
    }

    this.cycleRepository.merge(cycle, data);
    return this.cycleRepository.save(cycle);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.cycleRepository.delete({ cycleId: In(ids) });
    return result.affected !== 0;
  }

  async getWhere(condition: Partial<Cycle>): Promise<Cycle[]> {
    const whereCondition: any = {};


    if (condition.startYear) {
      whereCondition.startYear = condition.startYear;
    }

    if (condition.endYear) {
      whereCondition.endYear = condition.endYear;
    }

    return this.cycleRepository.find({
      where: whereCondition,
    });
  }

}
