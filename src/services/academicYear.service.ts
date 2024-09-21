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

  async getById(yearId: string): Promise<AcademicYear | null> {
    return this.academicYearRepository.findOneBy({ yearId });
  }

  async update(yearId: string, data: Partial<AcademicYear>): Promise<AcademicYear | null> {
    const academicYear = await this.academicYearRepository.findOneBy({ yearId });
    if (!academicYear) {
      return null;
    }
    this.academicYearRepository.merge(academicYear, data);
    return this.academicYearRepository.save(academicYear);
  }

  async delete(yearId: string): Promise<boolean> {
    const result = await this.academicYearRepository.delete({ yearId });
    return result.affected !== 0;
  }
}