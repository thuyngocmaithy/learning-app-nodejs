import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Score, ComponentScore } from '../entities/Score';
import { Semester } from '../entities/Semester';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';

export class ScoreService {
  private scoreRepository: Repository<Score>;
  private componentScoreRepository: Repository<ComponentScore>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.scoreRepository = dataSource.getRepository(Score);
    this.componentScoreRepository = dataSource.getRepository(ComponentScore);
    this.dataSource = dataSource;
  }

  public getAll = async (): Promise<Score[]> => {
    return this.scoreRepository.find({
      relations: ['subject', 'student', 'semester'],
    });
  };

  public getById = async (id: string): Promise<Score | null> => {
    const options: FindOneOptions<Score> = {
      where: { id },
      relations: ['subject', 'student', 'semester'],
    };
    return this.scoreRepository.findOne(options);
  };

  public create = async (scoreData: Partial<Score>): Promise<Score> => {
    const score = this.scoreRepository.create(scoreData);
    return this.scoreRepository.save(score);
  };

  public update = async (id: string, scoreData: Partial<Score>): Promise<Score | null> => {
    await this.scoreRepository.update(id, scoreData);
    const options: FindOneOptions<Score> = {
      where: { id },
      relations: ['subject', 'student', 'semester'],
    };
    return this.scoreRepository.findOne(options);
  };

  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.scoreRepository.delete({ id: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  };

  public getScoreByStudentId = async (studentId: string): Promise<Score[]> => {
    const scores = await this.scoreRepository.find({
      where: { student: { userId: studentId } },
      relations: ['subject', 'subject.frameComponents', 'semester'],
    });

    const uniqueScores = scores.filter((score, index, self) =>
      index === self.findIndex((s) => (
        s.subject.subjectId === score.subject.subjectId &&
        s.semester.semesterId === score.semester.semesterId
      ))
    );

    return uniqueScores;
  };



  public getScoreByStudentIdAndSemesterId = async (
    studentId: string,
    semesterId: string
  ): Promise<Score[]> => {
    return this.scoreRepository.find({
      where: { student: { userId: studentId }, semester: { semesterId: semesterId } },
      relations: ['subject', 'student', 'semester'],
    });
  };

  public getScoreByStudentIdAndSubjectId = async (
    studentId: string,
    subjectId: string
  ): Promise<Score | null> => {
    return this.scoreRepository.findOne({
      where: { student: { userId: studentId }, subject: { subjectId: subjectId } },
      relations: ['subject', 'student', 'semester'],
    });
  };

  async getUserScore(): Promise<any> {
    try {
      const query = 'CALL getUserScore()';
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Lỗi khi gọi stored procedure getUserScore', error);
      throw new Error('Lỗi khi gọi stored procedure');
    }
  }
}