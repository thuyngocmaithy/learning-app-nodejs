import { DataSource, Repository, FindOneOptions } from 'typeorm';
import { Thesis } from '../entities/Thesis';

export class ThesisService {
  private thesisRepository: Repository<Thesis>;

  constructor(dataSource: DataSource) {
    this.thesisRepository = dataSource.getRepository(Thesis);
  }

  public getAll = async (): Promise<Thesis[]> => {
    return await this.thesisRepository.find({
      relations: ['supervisor', 'faculty', 'status', 'createUser', 'lastModifyUser', 'registrations']
    });
  }
  

  public getById = async (id: string): Promise<Thesis | null> => {
    const options: FindOneOptions<Thesis> = { where: { id } };
    return await this.thesisRepository.findOne(options);
  }

  public create = async (thesisData: Partial<Thesis>): Promise<Thesis> => {
    const thesis = this.thesisRepository.create(thesisData);
    return await this.thesisRepository.save(thesis);
  }

  public update = async (id: string, thesisData: Partial<Thesis>): Promise<Thesis | null> => {
    await this.thesisRepository.update(id, thesisData);
    const options: FindOneOptions<Thesis> = { where: { id } };
    return await this.thesisRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.thesisRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}