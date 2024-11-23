import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { ExpectedScore } from '../entities/ExpectedScore';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';

export class ExpectedScoreService {
  private expectedScoreRepository: Repository<ExpectedScore>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.expectedScoreRepository = dataSource.getRepository(ExpectedScore);
    this.dataSource = dataSource;
  }

  public getAll = async (): Promise<ExpectedScore[]> => {
    return this.expectedScoreRepository.find({
      relations: ['subject', 'student'],
    });
  };

  public getById = async (id: string): Promise<ExpectedScore | null> => {
    const options: FindOneOptions<ExpectedScore> = {
      where: { id },
      relations: ['subject', 'student'],
    };
    return this.expectedScoreRepository.findOne(options);
  };

  public create = async (expectedScoreData: Partial<ExpectedScore>): Promise<ExpectedScore> => {
    const expectedScore = this.expectedScoreRepository.create(expectedScoreData);
    return this.expectedScoreRepository.save(expectedScore);
  };

  public update = async (id: string, expectedScoreData: Partial<ExpectedScore>): Promise<ExpectedScore | null> => {
    await this.expectedScoreRepository.update(id, expectedScoreData);
    const options: FindOneOptions<ExpectedScore> = {
      where: { id },
      relations: ['subject', 'student'],
    };
    return this.expectedScoreRepository.findOne(options);
  };

  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.expectedScoreRepository.delete({ id: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  };

  public getExpectedScoreByStudentId = async (studentId: string): Promise<ExpectedScore[]> => {
    return this.expectedScoreRepository.find({
      where: { student: { userId: studentId } },
      relations: ['subject', 'student'],
    });
  };

  public getExpectedScoreByStudentIdAndSubjectId = async (
    studentId: string,
    subjectId: string
  ): Promise<ExpectedScore | null> => {
    return this.expectedScoreRepository.findOne({
      where: {
        student: { userId: studentId },
        subject: { subjectId: subjectId }
      },
      relations: ['subject', 'student'],
    });
  };


  public deleteBySubjectsAndStudent = async (subjectId: string, studentId: string): Promise<boolean> => {
    const result = await this.expectedScoreRepository.delete({
      subject: { subjectId: subjectId },
      student: { userId: studentId }
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  };

}