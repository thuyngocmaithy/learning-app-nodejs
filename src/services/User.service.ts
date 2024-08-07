// user.service.ts
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/User';

export class UserService {
  private userRepository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['faculty', 'major', 'account', 'createUser', 'lastModifyUser'] });
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['faculty', 'major', 'account', 'createUser', 'lastModifyUser'] });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    this.userRepository.merge(user, data);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete({ id });
    return result.affected !== 0;
  }
}
