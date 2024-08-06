// academicYear.service.ts
import { DataSource, Repository } from 'typeorm';
import { AcademicYear } from '../entities/AcademicYear';

export class AcademicYearService {
  private academicYearRepository: Repository<AcademicYear>;

  constructor(dataSource: DataSource) {
    this.academicYearRepository = dataSource.getRepository(AcademicYear);
  }

  async create(data: Partial<AcademicYear>): Promise<AcademicYear> {
    const academicYear = this.academicYearRepository.create(data);
    return this.academicYearRepository.save(academicYear);
  }

  async getAll(): Promise<AcademicYear[]> {
    return this.academicYearRepository.find();
  }

  async getById(id: string): Promise<AcademicYear | null> {
    return this.academicYearRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<AcademicYear>): Promise<AcademicYear | null> {
    const academicYear = await this.academicYearRepository.findOneBy({ id });
    if (!academicYear) {
      return null;
    }
    this.academicYearRepository.merge(academicYear, data);
    return this.academicYearRepository.save(academicYear);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.academicYearRepository.delete({ id });
    return result.affected !== 0;
  }
}