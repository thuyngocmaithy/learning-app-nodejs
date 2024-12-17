import { DataSource, In, Repository } from 'typeorm';
import { Cycle } from '../entities/Cycle';
import { Semester } from '../entities/Semester';

export class CycleService {
  private cycleRepository: Repository<Cycle>;
  private semesterRepository: Repository<Semester>;

  constructor(dataSource: DataSource) {
    this.cycleRepository = dataSource.getRepository(Cycle);
    this.semesterRepository = dataSource.getRepository(Semester);
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

  async checkRelatedData(ids: string[]): Promise<{ success: boolean; message?: string }> {
    const relatedRepositories = [
      { repo: this.cycleRepository, name: 'dữ liệu học kỳ' },
    ];
    // Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
    for (const { repo, name } of relatedRepositories) {
      const count = await this.cycleRepository
        .createQueryBuilder('cycle')
        .leftJoin('cycle.semesters', 'semester') // Liên kết với bảng semesters
        .where('cycle.cycleId In (:...ids)', { ids }) // Kiểm tra theo cycleId
        .getCount(); // Đếm số lượng chu kỳ có liên kết với học kỳ

      if (count > 0) {
        return {
          success: false,
          message: `Chu kỳ đang được sử dụng trong ${name}. Bạn có chắc chắn xóa?`,
        };
      }
    }
    return { success: true };
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
