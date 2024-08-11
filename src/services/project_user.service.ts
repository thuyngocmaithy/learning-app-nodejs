import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Project_User } from '../entities/Project_User';

export class Project_UserService {
  private projectFacultyRepository: Repository<Project_User>;

  constructor(dataSource: DataSource) {
    this.projectFacultyRepository = dataSource.getRepository(Project_User);
  }

  public getAll = async (): Promise<Project_User[]> => {
    return this.projectFacultyRepository.find({
      relations: ['project', 'user']
    });
  }

  public getById = async (id: string): Promise<Project_User | null> => {
    const options: FindOneOptions<Project_User> = {
      where: { id },
      relations: ['project', 'user']
    };
    return this.projectFacultyRepository.findOne(options);
  }

  public create = async (projectFacultyData: Partial<Project_User>): Promise<Project_User> => {
    const projectFaculty = this.projectFacultyRepository.create(projectFacultyData);
    return this.projectFacultyRepository.save(projectFaculty);
  }

  public update = async (id: string, projectFacultyData: Partial<Project_User>): Promise<Project_User | null> => {
    await this.projectFacultyRepository.update(id, projectFacultyData);
    const options: FindOneOptions<Project_User> = {
      where: { id },
      relations: ['project', 'user']
    };
    return this.projectFacultyRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.projectFacultyRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}