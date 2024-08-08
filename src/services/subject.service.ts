// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Subject } from '../entities/Subject';

export class SubjectService {
  private subjectRepository: Repository<Subject>;

  constructor(dataSource: DataSource) {
    this.subjectRepository = dataSource.getRepository(Subject);
  }

  async create(data: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectRepository.create(data);
    return this.subjectRepository.save(subject);
  }

  async getAll(): Promise<Subject[]> {
    return this.subjectRepository.find({ relations: ['frame', 'createUser', 'lastModifyUser'] });
  }

  async getById(id: string): Promise<Subject | null> {
    const options: FindOneOptions<Subject> = { where: { id }, relations: ['frame', 'createUser', 'lastModifyUser'] };
    return await this.subjectRepository.findOne(options);
  }

  async update(id: string, data: Partial<Subject>): Promise<Subject | null> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) return null;
    this.subjectRepository.merge(subject, data);
    return this.subjectRepository.save(subject);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.subjectRepository.delete({ id });
    return result.affected !== 0;
  }
}
