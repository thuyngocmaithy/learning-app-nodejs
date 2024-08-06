import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Attach } from '../entities/Attach';

export class AttachService {
  private attachRepository: Repository<Attach>; 

  constructor(dataSource: DataSource) {
    this.attachRepository = dataSource.getRepository(Attach);
  }

  async getAll(): Promise<Attach[]> {
    return await this.attachRepository.find();
  }

  async getById(id: string): Promise<Attach | null> {
    const options: FindOneOptions<Attach> = { where: { id } };
    return await this.attachRepository.findOne(options);
  }

  async create(attach: Partial<Attach>): Promise<Attach> {
    const newAttach = this.attachRepository.create(attach);
    return await this.attachRepository.save(newAttach);
  }

  async update(id: string, attach: Partial<Attach>): Promise<Attach | null> {
    await this.attachRepository.update(id, attach);
    const options: FindOneOptions<Attach> = { where: { id } };
    return await this.attachRepository.findOne(options);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.attachRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}