// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { Cycle } from '../entities/Cycle';
import { StudyFrame_Faculty_Cycle } from '../entities/StudyFrame_Faculty_Cycle';

export class SubjectService {
  private subjectRepository: Repository<Subject>;
  private userRepository: Repository<User>;
  private cycleRepository: Repository<Cycle>;
  private studyFrame_Faculty_Cycle_Repository: Repository<StudyFrame_Faculty_Cycle>;
  private dataSource: DataSource;


  constructor(dataSource: DataSource) {
    this.subjectRepository = dataSource.getRepository(Subject);
    this.userRepository = AppDataSource.getRepository(User);
    this.cycleRepository = AppDataSource.getRepository(Cycle);
    this.studyFrame_Faculty_Cycle_Repository = AppDataSource.getRepository(StudyFrame_Faculty_Cycle);
    this.dataSource = dataSource;
  }

  async create(data: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectRepository.create(data);
    return this.subjectRepository.save(subject);
  }

  async getAll(): Promise<Subject[]> {
    return this.subjectRepository.find({ relations: ['createUser', 'lastModifyUser', 'subjectBefore'] });
  }

  async getById(subjectId: string): Promise<Subject | null> {
    const options: FindOneOptions<Subject> = { where: { subjectId }, relations: ['createUser', 'lastModifyUser', 'subjectBefore'] };
    return await this.subjectRepository.findOne(options);
  }

  async update(subjectId: string, data: Partial<Subject>): Promise<Subject | null> {
    const subject = await this.subjectRepository.findOne({ where: { subjectId } });
    if (!subject) return null;
    this.subjectRepository.merge(subject, data);
    return this.subjectRepository.save(subject);
  }

  async delete(subjectIds: string[]): Promise<boolean> {
    const result = await this.subjectRepository.delete({ subjectId: In(subjectIds) });
    return result.affected !== 0;
  }
}
