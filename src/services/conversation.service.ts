import { DataSource, In, Repository } from 'typeorm';
import { Conversation } from '../entities/Conversation';

export class ConversationService {
  private conversationRepository: Repository<Conversation>;

  constructor(dataSource: DataSource) {
    this.conversationRepository = dataSource.getRepository(Conversation);
  }

  async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversationRepository.create(data);
    return this.conversationRepository.save(conversation);
  }

  async getAll(): Promise<Conversation[]> {
    return this.conversationRepository.find();
  }

  async getById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    const conversation = await this.conversationRepository.findOneBy({ id });
    if (!conversation) {
      return null;
    }
    this.conversationRepository.merge(conversation, data);
    return this.conversationRepository.save(conversation);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.conversationRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }
}