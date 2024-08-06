import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Score } from '../entities/Score';

export class ScoreService {
  private scoreRepository: Repository<Score>;

  constructor(dataSource: DataSource) {
    this.scoreRepository = dataSource.getRepository(Score);
  }

  public getAll = async (): Promise<Score[]> => {
    return this.scoreRepository.find({
      relations: ['subject', 'student', 'createUser', 'lastModifyUser']
    });
  }

  public getById = async (id: string): Promise<Score | null> => {
    const options: FindOneOptions<Score> = { 
      where: { id },
      relations: ['subject', 'student', 'createUser', 'lastModifyUser']
    };
    return this.scoreRepository.findOne(options);
  }

  public create = async (scoreData: Partial<Score>): Promise<Score> => {
    const score = this.scoreRepository.create(scoreData);
    return this.scoreRepository.save(score);
  }

  public update = async (id: string, scoreData: Partial<Score>): Promise<Score | null> => {
    await this.scoreRepository.update(id, scoreData);
    const options: FindOneOptions<Score> = { 
      where: { id },
      relations: ['subject', 'student', 'createUser', 'lastModifyUser']
    };
    return this.scoreRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.scoreRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}