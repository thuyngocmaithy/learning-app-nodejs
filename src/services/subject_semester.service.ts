import { Repository, DataSource, FindOneOptions } from 'typeorm';

import { Subject_Semester } from '../entities/Subject_Semester';

export class Subject_SemesterService {
  private Subject_SemesterRepository: Repository<Subject_Semester>;

  constructor(dataSource: DataSource) {
    this.Subject_SemesterRepository = dataSource.getRepository(Subject_Semester);
  }

  public getAll = async (): Promise<Subject_Semester[]> => {
    return this.Subject_SemesterRepository.find({
        relations: ['subject', 'semester']
    });
  }

  public getById = async (id: string): Promise<Subject_Semester | null> => {
    const options: FindOneOptions<Subject_Semester> = { 
      where: { id },
      relations: ['permission', 'feature']
    };
    return this.Subject_SemesterRepository.findOne(options);
  }

  public create = async (Subject_SemesterData: Partial<Subject_Semester>): Promise<Subject_Semester> => {
    const Subject_Semester = this.Subject_SemesterRepository.create(Subject_SemesterData);
    return this.Subject_SemesterRepository.save(Subject_Semester);
  }

  public update = async (id: string, Subject_SemesterData: Partial<Subject_Semester>): Promise<Subject_Semester | null> => {
    await this.Subject_SemesterRepository.update(id, Subject_SemesterData);
    const options: FindOneOptions<Subject_Semester> = { 
      where: { id },
      relations: ['subject', 'semester']
    };
    return this.Subject_SemesterRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.Subject_SemesterRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}