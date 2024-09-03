import { Repository, DataSource, FindOneOptions, Int32 } from 'typeorm';
import { Project_User } from '../entities/Project_User';
import { User } from '../entities/User';
import { Project } from '../entities/Project';

export class Project_UserService {
  private projectUserRepository: Repository<Project_User>;

  constructor(dataSource: DataSource) {
    this.projectUserRepository = dataSource.getRepository(Project_User);
  }

  public getAll = async (): Promise<Project_User[]> => {
    return this.projectUserRepository.find({
      relations: ['project', 'user']
    });
  }

  public getById = async (id: string): Promise<Project_User | null> => {
    const options: FindOneOptions<Project_User> = {
      where: { id },
      relations: ['project', 'user', 'project.createUser', 'project.instructor', 'project.lastModifyUser', 'project.faculty']
    };
    return this.projectUserRepository.findOne(options);
  }

  public create = async (projectUserData: Partial<Project_User>): Promise<Project_User> => {
    const projectUser = this.projectUserRepository.create(projectUserData);
    return this.projectUserRepository.save(projectUser);
  }

  public update = async (id: string, projectUserData: Partial<Project_User>): Promise<Project_User | null> => {
    await this.projectUserRepository.update(id, projectUserData);
    const options: FindOneOptions<Project_User> = {
      where: { id },
      relations: ['project', 'user']
    };
    return this.projectUserRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.projectUserRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  public getHighestGroupProjectUser = async (): Promise<number> => {
    const projectUsers = await this.projectUserRepository.find({
      order: { group: 'DESC' },  // Sort by `group` in descending order
      relations: ['project', 'user'],
      take: 1  // Limit to one result
    });

    // If no rows are found, return 0
    if (!projectUsers.length) {
      return 0;
    }

    const projectUser = projectUsers[0];
    console.log(projectUser.group);
    return projectUser.group || 0;
  }

  public getByUserId = async (user: User): Promise<Project_User[]> => {
    const options: FindOneOptions<Project_User> = {
      where: { user },
      relations: ['project', 'user', 'project.createUser', 'project.instructor', 'project.lastModifyUser', 'project.faculty']
    };
    return this.projectUserRepository.find(options);
  }

  public getByProjectId = async (project: Project): Promise<Project_User[]> => {
    const options: FindOneOptions<Project_User> = {
      where: { project: { projectId: project.projectId } },
      relations: ['project', 'user', 'project.createUser', 'project.instructor', 'project.lastModifyUser', 'project.faculty']
    };
    return this.projectUserRepository.find(options);
  }

  // Xóa bằng user và project
  public deleteByUserAndProject = async (user: User, project: Project): Promise<boolean> => {
    const result = await this.projectUserRepository.delete({
      user,
      project
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}