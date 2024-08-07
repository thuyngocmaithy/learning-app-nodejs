import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Project_Faculty } from '../entities/Project_Faculty';

export class Project_FacultyService {
  private projectFacultyRepository: Repository<Project_Faculty>;

  constructor(dataSource: DataSource) {
    this.projectFacultyRepository = dataSource.getRepository(Project_Faculty);
  }

  public getAll = async (): Promise<Project_Faculty[]> => {
    return this.projectFacultyRepository.find({
      relations: ['project', 'faculty']
    });
  }

  public getById = async (id: string): Promise<Project_Faculty | null> => {
    const options: FindOneOptions<Project_Faculty> = { 
      where: { id },
      relations: ['project', 'faculty']
    };
    return this.projectFacultyRepository.findOne(options);
  }

  public create = async (projectFacultyData: Partial<Project_Faculty>): Promise<Project_Faculty> => {
    const projectFaculty = this.projectFacultyRepository.create(projectFacultyData);
    return this.projectFacultyRepository.save(projectFaculty);
  }

  public update = async (id: string, projectFacultyData: Partial<Project_Faculty>): Promise<Project_Faculty | null> => {
    await this.projectFacultyRepository.update(id, projectFacultyData);
    const options: FindOneOptions<Project_Faculty> = { 
      where: { id },
      relations: ['project', 'faculty']
    };
    return this.projectFacultyRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.projectFacultyRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}