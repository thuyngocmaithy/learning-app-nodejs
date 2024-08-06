// faculty.service.ts
import { DataSource, Repository } from 'typeorm';
import { Faculty } from '../entities/Faculty';

export class FacultyService {
  private facultyRepository: Repository<Faculty>;

  constructor(dataSource: DataSource) {
    this.facultyRepository = dataSource.getRepository(Faculty);
  }

  async create(data: Partial<Faculty>): Promise<Faculty> {
    const faculty = this.facultyRepository.create(data);
    return this.facultyRepository.save(faculty);
  }

  async getAll(): Promise<Faculty[]> {
    return this.facultyRepository.find();
  }

  async getById(id: string): Promise<Faculty | null> {
    return this.facultyRepository.findOneBy({ id });
  }

  async getByFacultyId(facultyId: string): Promise<Faculty | null> {
    return this.facultyRepository.findOneBy({ facultyId });
  }

  async update(id: string, data: Partial<Faculty>): Promise<Faculty | null> {
    const faculty = await this.facultyRepository.findOneBy({ id });
    if (!faculty) {
      return null;
    }
    this.facultyRepository.merge(faculty, data);
    return this.facultyRepository.save(faculty);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.facultyRepository.delete({ id });
    return result.affected !== 0;
  }
}