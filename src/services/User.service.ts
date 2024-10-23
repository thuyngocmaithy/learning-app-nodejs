// user.service.ts
import { DataSource, In, Repository } from 'typeorm';
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
    return this.userRepository.findOne({ where: { userId: id }, relations: ['faculty', 'major', 'account', 'createUser', 'lastModifyUser'] });
  }


  async getByUserId(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { userId }, relations: ['faculty', 'major', 'account', 'account.permission' , 'createUser', 'lastModifyUser'] });
  }


  // Phương thức mới để lấy người dùng với isStudent = 0 và isActive = 1
  async getActiveNonStudents(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        isStudent: false, // Tìm người dùng không phải là sinh viên
        isActive: true,   // Tìm người dùng đang hoạt động
      },
      relations: ['faculty', 'major', 'account', 'createUser', 'lastModifyUser'],
    });
  }

  // Phương thức mới để lấy danh sách người dùng là sinh viên và đang hoạt động
  async getActiveStudents(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        isStudent: true,
        isActive: true,
      },
      relations: ['faculty', 'major', 'account', 'createUser', 'lastModifyUser'],
    });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { userId: id } });
    if (!user) {
      return null;
    }
    this.userRepository.merge(user, data);
    return this.userRepository.save(user);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.userRepository.delete({ userId: In(ids) });
    return result.affected !== 0;
  }

  async getUsersByFaculty(facultyId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        isStudent: false,
        isActive: true,
        faculty: { facultyId }
      },
      relations: ['faculty', 'major', 'account', 'createUser', 'lastModifyUser'],
    });
  }

}
