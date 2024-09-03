// project.service.ts
import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn } from 'typeorm';
import { Project } from '../entities/Project';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';

export class ProjectService {
  private projectRepository: Repository<Project>;
  private facultyRepository: Repository<Faculty>;
  private userRepository: Repository<User>;
  private statusRepository: Repository<Status>;

  constructor(dataSource: DataSource) {
    this.projectRepository = dataSource.getRepository(Project);
    this.facultyRepository = dataSource.getRepository(Faculty);
    this.userRepository = dataSource.getRepository(User);
    this.statusRepository = dataSource.getRepository(Status);
  }

  async getAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['status', 'faculty', 'instructor', 'createUser', 'lastModifyUser'] });
  }

  async getById(projectId: string): Promise<Project | null> {
    return this.projectRepository.findOne({ where: { projectId }, relations: ['status', 'faculty', 'instructor', 'createUser', 'lastModifyUser'] });
  }

  public create = async (projectData: any): Promise<Project> => {
    if (!projectData.instructorId) {
      throw new Error('instructor ID is required');
    }
    if (!projectData.facultyId) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepository.findOne({ where: { facultyId: projectData.facultyId } });
    if (!faculty) {
      throw new Error('Invalid Faculty ID');
    }

    const instructor = await this.userRepository.findOne({ where: { userId: projectData.instructorId } });
    if (!instructor) {
      throw new Error('Invalid instructor ID');
    }

    const status = await this.statusRepository.findOne({ where: { statusId: projectData.statusId } });
    if (!status) {
      throw new Error('Invalid Status ID');
    }

    const newId = await this.generateNewId(projectData.facultyId);

    const project = this.projectRepository.create({
      projectId: newId,
      projectName: projectData.projectName,
      description: projectData.description,
      executionTime: projectData.executionTime,
      numberOfMember: projectData.numberOfMember,
      faculty: faculty,
      instructor: instructor,
      status: status,
      createUser: projectData.createUserId,
      lastModifyUser: projectData.lastModifyUserId,
    });

    return await this.projectRepository.save(project);
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
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
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
