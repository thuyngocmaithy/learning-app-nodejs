import { DataSource, Repository, FindOneOptions, Like, CreateDateColumn } from 'typeorm';
import { Thesis } from '../entities/Thesis';
import { Faculty } from '../entities/Faculty';
import { User } from '../entities/User';
import { Status } from '../entities/Status';

export class ThesisService {
  private thesisRepository: Repository<Thesis>;
  private facultyRepository: Repository<Faculty>;
  private userRepository: Repository<User>;
  private statusRepository: Repository<Status>;

  constructor(dataSource: DataSource) {
    this.thesisRepository = dataSource.getRepository(Thesis);
    this.facultyRepository = dataSource.getRepository(Faculty);
    this.userRepository = dataSource.getRepository(User);
    this.statusRepository = dataSource.getRepository(Status);
  }

  public getAll = async (): Promise<Thesis[]> => {
    return await this.thesisRepository.find({
      relations: ['supervisor', 'faculty', 'status', 'createUser', 'lastModifyUser', 'registrations']
    });
  }

  public getById = async (id: string): Promise<Thesis | null> => {
    const options: FindOneOptions<Thesis> = { 
      where: { id },
      relations: ['supervisor', 'faculty', 'status', 'createUser', 'lastModifyUser', 'registrations']
    };
    return await this.thesisRepository.findOne(options);
  }

  public create = async (thesisData: any): Promise<Thesis> => {
    if (!thesisData.supervisor) {
      throw new Error('Supervisor ID is required');
    }
    if (!thesisData.facultyId) {
      throw new Error('Faculty ID is required');
    }
  
    const faculty = await this.facultyRepository.findOne({ where: { facultyId: thesisData.facultyId } });
    if (!faculty) {
      throw new Error('Invalid Faculty ID');
    }
  
    const supervisor = await this.userRepository.findOne({ where: { id: thesisData.supervisor } });
    if (!supervisor) {
      throw new Error('Invalid Supervisor ID');
    }
  
    const status = await this.statusRepository.findOne({ where: { statusId: thesisData.statusId } });
    if (!status) {
      throw new Error('Invalid Status ID');
    }
  
    const newId = await this.generateNewId(thesisData.facultyId);
  
    const thesis = this.thesisRepository.create({
      id: newId,
      title: thesisData.title,
      description: thesisData.description,
      startDate: thesisData.startDate,
      endDate: thesisData.endDate,
      registrationCount: thesisData.registrationCount,
      faculty: faculty,
      supervisor: supervisor,
      status: status,
      createUser: thesisData.createUserId,
      lastModifyUser: thesisData.lastModifyUserId,
    });
  
    return await this.thesisRepository.save(thesis);
  }
  

  private generateNewId = async (facultyId: string): Promise<string> => {
    // Find the last thesis for this faculty
    const lastThesis = await this.thesisRepository.findOne({
      where: { id: Like(`${facultyId}%`) },
      order: { id: 'DESC' }
    });

    let numericPart = 1;
    if (lastThesis) {
      // Extract the numeric part and increment it
      const lastNumericPart = parseInt(lastThesis.id.slice(facultyId.length), 10);
      numericPart = lastNumericPart + 1;
    }

    // Format the new ID
    return `${facultyId}${numericPart.toString().padStart(3, '0')}`;
  }

  public update = async (id: string, thesisData: any): Promise<Thesis> => {
    const existingThesis = await this.thesisRepository.findOne({ where: { id } });
    if (!existingThesis) {
      throw new Error('Thesis not found');
    }
  
    if (thesisData.facultyId) {
      const faculty = await this.facultyRepository.findOne({ where: { facultyId: thesisData.facultyId } });
      if (!faculty) {
        throw new Error('Invalid Faculty ID');
      }
      existingThesis.faculty = faculty;
    }
  
    if (thesisData.supervisorId) {
      const supervisor = await this.userRepository.findOne({ where: { id: thesisData.supervisorId } });
      if (!supervisor) {
        throw new Error('Invalid Supervisor ID');
      }
      existingThesis.supervisor = supervisor;
    }
  
    if (thesisData.statusId) {
      const status = await this.statusRepository.findOne({ where: { statusId: thesisData.statusId } });
      if (!status) {
        throw new Error('Invalid Status ID');
      }
      existingThesis.status = status;
    }
  
    Object.assign(existingThesis, {
      title: thesisData.title,
      description: thesisData.description,
      startDate: thesisData.startDate,
      endDate: thesisData.endDate,
      registrationCount: thesisData.registrationCount,
      lastModifyUser: thesisData.lastModifyUserId
    });
  
    return await this.thesisRepository.save(existingThesis);
  }
  

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.thesisRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}