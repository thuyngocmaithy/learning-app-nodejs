
import { DataSource, In, Repository } from 'typeorm';
import { Semester } from '../entities/Semester';

export class SemesterService {
  private semesterRepository: Repository<Semester>;

  constructor(dataSource: DataSource) {
    this.semesterRepository = dataSource.getRepository(Semester);
  }

  async create(data: Partial<Semester>): Promise<Semester> {
    const semester = this.semesterRepository.create(data);
    return this.semesterRepository.save(semester);
  }

  async getAll(): Promise<Semester[]> {
    return this.semesterRepository.find({ relations: ['academicYear'] });
  }

  async getById(id: string): Promise<Semester | null> {
    return this.semesterRepository.findOne({ where: { id }, relations: ['academicYear'] });
  }

  async update(id: string, data: Partial<Semester>): Promise<Semester | null> {
    const semester = await this.semesterRepository.findOne({ where: { id }, relations: ['academicYear'] });
    if (!semester) {
      return null;
    }
    this.semesterRepository.merge(semester, data);
    return this.semesterRepository.save(semester);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.semesterRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }
}