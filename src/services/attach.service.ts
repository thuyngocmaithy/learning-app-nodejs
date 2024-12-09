import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
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

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.attachRepository.delete({ filename: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async getWhere(condition: any): Promise<Attach[]> {
    const whereCondition: any = {};


    if (condition.SRId) {
      whereCondition.scientificResearch = { scientificResearchId: condition.SRId };
    }
    if (condition.thesisId) {
      whereCondition.thesis = { thesisId: condition.thesisId };
    }

    return this.attachRepository.find({
      where: whereCondition,
      relations: ['createUser']
    });
  }

}