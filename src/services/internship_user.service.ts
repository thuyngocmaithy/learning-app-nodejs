import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Internship_User } from '../entities/Internship_User';

export class Internship_UserService {
  private internshipFacultyRepository: Repository<Internship_User>;

  constructor(dataSource: DataSource) {
    this.internshipFacultyRepository = dataSource.getRepository(Internship_User);
  }

  public getAll = async (): Promise<Internship_User[]> => {
    return this.internshipFacultyRepository.find({
      relations: ['internship', 'user']
    });
  }

  public getById = async (id: string): Promise<Internship_User | null> => {
    const options: FindOneOptions<Internship_User> = {
      where: { id },
      relations: ['internship', 'user']
    };
    return this.internshipFacultyRepository.findOne(options);
  }

  public create = async (internshipFacultyData: Partial<Internship_User>): Promise<Internship_User> => {
    const internshipFaculty = this.internshipFacultyRepository.create(internshipFacultyData);
    return this.internshipFacultyRepository.save(internshipFaculty);
  }

  public update = async (id: string, internshipFacultyData: Partial<Internship_User>): Promise<Internship_User | null> => {
    await this.internshipFacultyRepository.update(id, internshipFacultyData);
    const options: FindOneOptions<Internship_User> = {
      where: { id },
      relations: ['internship', 'user']
    };
    return this.internshipFacultyRepository.findOne(options);
  }

  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.internshipFacultyRepository.delete({id: In(ids)});
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}