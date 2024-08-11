// project.service.ts
import { DataSource, Repository } from 'typeorm';
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
    return this.projectRepository.find({ relations: ['status', 'instructor', 'createUser', 'lastModifyUser'] });
  }

  async getById(projectId: string): Promise<Project | null> {
    return this.projectRepository.findOne({ where: { projectId }, relations: ['status', 'instructor', 'createUser', 'lastModifyUser'] });
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
}
