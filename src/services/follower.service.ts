// src/services/follower.service.ts
import { Repository } from 'typeorm';
import { Follower } from '../entities/Follower';
import { DataSource } from 'typeorm';

export class FollowerService {
  private followerRepository: Repository<Follower>;

  constructor(dataSource: DataSource) {
    this.followerRepository = dataSource.getRepository(Follower);
  }

  async create(data: Partial<Follower>): Promise<Follower> {
    const follower = this.followerRepository.create(data);
    return this.followerRepository.save(follower);
  }

  async getAll(): Promise<Follower[]> {
    return this.followerRepository.find({ relations: ['internship', 'project'] });
  }

  async getById(id: string): Promise<Follower | null> {
    return this.followerRepository.findOne({ where: { id }, relations: ['internship', 'project'] });
  }

  async update(id: string, data: Partial<Follower>): Promise<Follower | null> {
    const follower = await this.followerRepository.findOne({ where: { id } });
    if (!follower) return null;
    this.followerRepository.merge(follower, data);
    return this.followerRepository.save(follower);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.followerRepository.delete({ id });
    return result.affected !== 0;
  }
}
