import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { ComponentScore } from '../entities/Score';

export class ComponentScoreService {
  private componentScoreRepository: Repository<ComponentScore>;

  constructor(dataSource: DataSource) {
    this.componentScoreRepository = dataSource.getRepository(ComponentScore);
  }

  public getAll = async (): Promise<ComponentScore[]> => {
    return this.componentScoreRepository.find({
      relations: ['score']
    });
  }

  public getById = async (id: string): Promise<ComponentScore | null> => {
    const options: FindOneOptions<ComponentScore> = { 
      where: { id },
      relations: ['score']
    };
    return this.componentScoreRepository.findOne(options);
  }

  public create = async (componentScoreData: Partial<ComponentScore>): Promise<ComponentScore> => {
    const componentScore = this.componentScoreRepository.create(componentScoreData);
    return this.componentScoreRepository.save(componentScore);
  }

  public update = async (id: string, componentScoreData: Partial<ComponentScore>): Promise<ComponentScore | null> => {
    await this.componentScoreRepository.update(id, componentScoreData);
    const options: FindOneOptions<ComponentScore> = { 
      where: { id },
      relations: ['score']
    };
    return this.componentScoreRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.componentScoreRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}