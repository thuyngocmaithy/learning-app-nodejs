// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In, LessThan, MoreThan, LessThanOrEqual } from 'typeorm';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { Faculty } from '../entities/Faculty';
import { Cycle } from '../entities/Cycle';
import { StudyFrame_Faculty_Cycle } from '../entities/StudyFrame_Faculty_Cycle';

export class SubjectService {
  private subjectRepository: Repository<Subject>;
  private userRepository: Repository<User>;
  private cycleRepository: Repository<Cycle>;
  private studyFrame_Faculty_Cycle_Repository: Repository<StudyFrame_Faculty_Cycle>;
  private dataSource: DataSource;
  

  constructor(dataSource: DataSource) {
    this.subjectRepository = dataSource.getRepository(Subject);
    this.userRepository = AppDataSource.getRepository(User);
    this.cycleRepository = AppDataSource.getRepository(Cycle);
    this.studyFrame_Faculty_Cycle_Repository = AppDataSource.getRepository(StudyFrame_Faculty_Cycle);
    this.dataSource = dataSource;
  }

  async create(data: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectRepository.create(data);
    return this.subjectRepository.save(subject);
  }

  async getAll(): Promise<Subject[]> {
    return this.subjectRepository.find({ relations: ['frames', 'createUser', 'lastModifyUser', 'subjectBefore'] });
  }

  async getById(subjectId: string): Promise<Subject | null> {
    const options: FindOneOptions<Subject> = { where: { subjectId }, relations: ['frames', 'createUser', 'lastModifyUser'] };
    return await this.subjectRepository.findOne(options);
  }

  async update(subjectId: string, data: Partial<Subject>): Promise<Subject | null> {
    const subject = await this.subjectRepository.findOne({ where: { subjectId } });
    if (!subject) return null;
    this.subjectRepository.merge(subject, data);
    return this.subjectRepository.save(subject);
  }

  async delete(subjectIds: string[]): Promise<boolean> {
    const result = await this.subjectRepository.delete({ subjectId: In(subjectIds) });
    return result.affected !== 0;
  }

  // Gọi store lấy danh sách môn theo khung
  async callKhungCTDT(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where:{ userId: userId},
        relations: ['faculty']
      });
      if (!user) {
        throw new Error('Not found entity user');
      }    
      // Lấy năm đầu tiên của niên khóa
      const startYear = parseInt(user.nien_khoa.split("-")[0], 10); // Chuyển startYear thành number

      // Tìm chu kỳ của user => Năm đầu tiên của niên khóa lớn hơn hoặc bằng startYear, nhỏ hơn endYear
      const cycle = await this.cycleRepository.findOne({
        where: {
          startYear: LessThanOrEqual(startYear),
          endYear: MoreThan(startYear)
        },
      });
      if (!cycle) {
        throw new Error('Not found entity cycle');
      }

      // Tìm khung đào tạo theo ngành và chu kỳ
      const studyFrame_Faculty_Cycle = await this.studyFrame_Faculty_Cycle_Repository.findOne({
        where:{
          faculty: user.faculty,
          cycle: cycle
        },
        relations:['studyFrame']
      }
      )

      const query = 'CALL KhungCTDT(?)';
      const [results] = await this.dataSource.query(query, [studyFrame_Faculty_Cycle?.studyFrame.frameId]);
        
      const resultSet = results[0];

      if (!resultSet || resultSet.length === 0) {
        return [];
      }

      return results;
    } catch (error) {
      console.error('Lỗi khi gọi stored procedure callKhungCTDT', error);
      throw new Error('Lỗi khi gọi stored procedure');
    }
  }

}
