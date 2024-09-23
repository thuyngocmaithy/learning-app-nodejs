// internship.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Internship } from '../entities/Internship';

export class InternshipService {
  private internshipRepository: Repository<Internship>;

  constructor(dataSource: DataSource) {
    this.internshipRepository = dataSource.getRepository(Internship);
  }

  async create(data: Partial<Internship>): Promise<Internship> {
    const internship = this.internshipRepository.create(data);
    return this.internshipRepository.save(internship);
  }

  async getAll(): Promise<Internship[]> {
    return this.internshipRepository.find({ relations: ['createUser', 'lastModifyUser'] });
  }

  async getById(id: string): Promise<Internship | null> {
    return this.internshipRepository.findOne({ where: { id }, relations: ['createUser', 'lastModifyUser'] });
  }

  async update(id: string, data: Partial<Internship>): Promise<Internship | null> {
    const internship = await this.internshipRepository.findOne({ where: { id } });
    if (!internship) {
      return null;
    }
    this.internshipRepository.merge(internship, data);
    return this.internshipRepository.save(internship);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.internshipRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }
}
