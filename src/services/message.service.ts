import { DataSource, In, Repository } from 'typeorm';
import { Message } from '../entities/Message';

export class MessageService {
  private messageRepository: Repository<Message>;

  constructor(dataSource: DataSource) {
    this.messageRepository = dataSource.getRepository(Message);
  }

  async create(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(data);
    return this.messageRepository.save(message);
  }

  async getAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }

  async getById(id: string): Promise<Message | null> {
    return this.messageRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<Message>): Promise<Message | null> {
    const message = await this.messageRepository.findOneBy({ id });
    if (!message) {
      return null;
    }
    this.messageRepository.merge(message, data);
    return this.messageRepository.save(message);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.messageRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }


  async getWhere(condition: any): Promise<Message[]> {
    const whereCondition: any = {};


    if (condition.SRId) {
      whereCondition.scientificResearch = { scientificResearchId: condition.SRId };
    }

    if (condition.thesisId) {
      whereCondition.thesis = { thesisId: condition.thesisId };
    }

    return this.messageRepository.find({
      order: { createDate: 'ASC' },
      where: whereCondition,
      relations: ['scientificResearch', 'sender', 'thesis']
    });
  }
}