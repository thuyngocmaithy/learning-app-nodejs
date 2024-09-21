
import { DataSource, Repository } from 'typeorm';
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

  async getById(semesterId: string): Promise<Semester | null> {
    return this.semesterRepository.findOne({ where: { semesterId }, relations: ['academicYear'] });
  }

  async update(semesterId: string, data: Partial<Semester>): Promise<Semester | null> {
    const semester = await this.semesterRepository.findOne({ where: { semesterId }, relations: ['academicYear'] });
    if (!semester) {
      return null;
    }
    this.semesterRepository.merge(semester, data);
    return this.semesterRepository.save(semester);
  }

  async delete(semesterId: string): Promise<boolean> {
    const result = await this.semesterRepository.delete({ semesterId });
    return result.affected !== 0;
  }
}