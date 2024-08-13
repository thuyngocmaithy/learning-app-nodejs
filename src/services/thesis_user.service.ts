import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Thesis_User } from '../entities/Thesis_User';

export class Thesis_UserService {
  private thesisFacultyRepository: Repository<Thesis_User>;

  constructor(dataSource: DataSource) {
    this.thesisFacultyRepository = dataSource.getRepository(Thesis_User);
  }

  public getAll = async (): Promise<Thesis_User[]> => {
    return this.thesisFacultyRepository.find({
      relations: ['thesis', 'user']
    });
  }

  public getById = async (id: string): Promise<Thesis_User | null> => {
    const options: FindOneOptions<Thesis_User> = {
      where: { id },
      relations: ['thesis', 'user']
    };
    return this.thesisFacultyRepository.findOne(options);
  }

  public create = async (thesisFacultyData: Partial<Thesis_User>): Promise<Thesis_User> => {
    const thesisFaculty = this.thesisFacultyRepository.create(thesisFacultyData);
    return this.thesisFacultyRepository.save(thesisFaculty);
  }

  public update = async (id: string, thesisFacultyData: Partial<Thesis_User>): Promise<Thesis_User | null> => {
    await this.thesisFacultyRepository.update(id, thesisFacultyData);
    const options: FindOneOptions<Thesis_User> = {
      where: { id },
      relations: ['thesis', 'user']
    };
    return this.thesisFacultyRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.thesisFacultyRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}