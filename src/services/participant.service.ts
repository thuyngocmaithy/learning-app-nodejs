import { DataSource, In, Repository } from 'typeorm';
import { Participant } from '../entities/Participant';

export class ParticipantService {
  private participantRepository: Repository<Participant>;

  constructor(dataSource: DataSource) {
    this.participantRepository = dataSource.getRepository(Participant);
  }

  async create(data: Partial<Participant>): Promise<Participant> {
    const participant = this.participantRepository.create(data);
    return this.participantRepository.save(participant);
  }

  async getAll(): Promise<Participant[]> {
    return this.participantRepository.find();
  }

  async getById(id: string): Promise<Participant | null> {
    return this.participantRepository.findOneBy({ id });
  }

  async update(id: string, data: Partial<Participant>): Promise<Participant | null> {
    const participant = await this.participantRepository.findOneBy({ id });
    if (!participant) {
      return null;
    }
    this.participantRepository.merge(participant, data);
    return this.participantRepository.save(participant);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.participantRepository.delete({ id : In(ids)});
    return result.affected !== 0;
  }
}