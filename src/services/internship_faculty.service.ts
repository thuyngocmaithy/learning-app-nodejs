import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Internship_Faculty } from '../entities/Internship_Faculty';

export class Internship_FacultyService {
  private internshipFacultyRepository: Repository<Internship_Faculty>;

  constructor(dataSource: DataSource) {
    this.internshipFacultyRepository = dataSource.getRepository(Internship_Faculty);
  }

  public getAll = async (): Promise<Internship_Faculty[]> => {
    return this.internshipFacultyRepository.find({
      relations: ['internship', 'faculty']
    });
  }

  public getById = async (id: string): Promise<Internship_Faculty | null> => {
    const options: FindOneOptions<Internship_Faculty> = { 
      where: { id },
      relations: ['internship', 'faculty']
    };
    return this.internshipFacultyRepository.findOne(options);
  }

  public create = async (internshipFacultyData: Partial<Internship_Faculty>): Promise<Internship_Faculty> => {
    const internshipFaculty = this.internshipFacultyRepository.create(internshipFacultyData);
    return this.internshipFacultyRepository.save(internshipFaculty);
  }

  public update = async (id: string, internshipFacultyData: Partial<Internship_Faculty>): Promise<Internship_Faculty | null> => {
    await this.internshipFacultyRepository.update(id, internshipFacultyData);
    const options: FindOneOptions<Internship_Faculty> = { 
      where: { id },
      relations: ['internship', 'faculty']
    };
    return this.internshipFacultyRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.internshipFacultyRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}