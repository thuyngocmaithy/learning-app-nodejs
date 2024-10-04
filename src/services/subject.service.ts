// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Subject } from '../entities/Subject';

export class SubjectService {
  private subjectRepository: Repository<Subject>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.subjectRepository = dataSource.getRepository(Subject);
    this.dataSource = dataSource;
  }

  async create(data: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectRepository.create(data);
    return this.subjectRepository.save(subject);
  }

  async getAll(): Promise<Subject[]> {
    return this.subjectRepository.find({ relations: ['frame', 'createUser', 'lastModifyUser', 'subjectBefore'] });
  }

  async getById(subjectId: string): Promise<Subject | null> {
    const options: FindOneOptions<Subject> = { where: { subjectId }, relations: ['frame', 'createUser', 'lastModifyUser'] };
    return await this.subjectRepository.findOne(options);
  }

  async update(subjectId: string, data: Partial<Subject>): Promise<Subject | null> {
    const subject = await this.subjectRepository.findOne({ where: { subjectId } });
    if (!subject) return null;
    this.subjectRepository.merge(subject, data);
    return this.subjectRepository.save(subject);
  }

  async delete(subjectIds: string[]): Promise<boolean> {
    const result = await this.subjectRepository.delete({ subjectId : In(subjectIds)});
    return result.affected !== 0;
  }

  // Gọi store lấy danh sách môn theo khung
  async callKhungCTDT(): Promise<any> {
    try {
      const query = 'CALL KhungCTDT()';
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Lỗi khi gọi stored procedure callKhungCTDT', error);
      throw new Error('Lỗi khi gọi stored procedure');
    }
  }

}
