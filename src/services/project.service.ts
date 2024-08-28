// project.service.ts
import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn } from 'typeorm';
import { Project } from '../entities/Project';

export class ProjectService {
  private projectRepository: Repository<Project>;

  constructor(dataSource: DataSource) {
    this.projectRepository = dataSource.getRepository(Project);
  }

  async create(data: Partial<Project>): Promise<Project> {
    const project = this.projectRepository.create(data);
    return this.projectRepository.save(project);
  }

  async getAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['status','faculty', 'instructor', 'createUser', 'lastModifyUser'] });
  }

  async getById(projectId: string): Promise<Project | null> {
    return this.projectRepository.findOne({ where: { projectId }, relations: ['status','faculty', 'instructor', 'createUser', 'lastModifyUser'] });
  }

  async update(projectId: string, data: Partial<Project>): Promise<Project | null> {
    const project = await this.projectRepository.findOne({ where: { projectId } });
    if (!project) {
      return null;
    }
    this.projectRepository.merge(project, data);
    return this.projectRepository.save(project);
  }

  async delete(projectId: string): Promise<boolean> {
    const result = await this.projectRepository.delete({ projectId });
    return result.affected !== 0;
  }


  private generateNewId = async (facultyId: string): Promise<string> => {
    // Find the last thesis for this faculty
    const lastTProject = await this.projectRepository.findOne({
      where: { projectId: Like(`${facultyId}%`) },
      order: { projectId: 'DESC' }
    });

    let numericPart = 1;
    if (lastTProject) {
      // Extract the numeric part and increment it
      const lastNumericPart = parseInt(lastTProject.projectId.slice(facultyId.length), 10);
      numericPart = lastNumericPart + 1;
    }

    // Format the new ID
    return `${facultyId}PROJECT${numericPart.toString().padStart(3, '0')}`;
  }

}
