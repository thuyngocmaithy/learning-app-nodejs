import { Major } from './../entities/Major';
// studyFrame.service.ts
import { DataSource, In, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { StudyFrame, StudyFrame_Component } from '../entities/StudyFrame';
import { User } from '../entities/User';
import { Cycle } from '../entities/Cycle';
import { AppDataSource } from '../data-source';
import { Faculty } from '../entities/Faculty';

export class StudyFrameService {
  private studyFrameRepository: Repository<StudyFrame>;
  private userRepository: Repository<User>;
  private cycleRepository: Repository<Cycle>;
  private facultyRepository: Repository<Faculty>;
  private studyFrameComponentRepository: Repository<StudyFrame_Component>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.studyFrameRepository = dataSource.getRepository(StudyFrame);
    this.userRepository = AppDataSource.getRepository(User);
    this.cycleRepository = AppDataSource.getRepository(Cycle);
    this.facultyRepository = AppDataSource.getRepository(Faculty);
    this.studyFrameComponentRepository = dataSource.getRepository(StudyFrame_Component);
    this.dataSource = dataSource;
  }

  async create(data: any): Promise<StudyFrame> {
    // Tìm entity cycle
    const cycle = await this.cycleRepository.findOne({ where: { cycleId: data.cycleId } });
    if (!cycle) {
      throw new Error('SemesterService - create - Not found cycle');
    }

    // Tìm entity faculty update theo id
    const faculty = await this.facultyRepository.findOne({ where: { facultyId: data.facultyId } });
    if (!faculty) {
      throw new Error('SemesterService - create - Not found cycle');
    }

    const dataCreate = {
      frameId: data.frameId,
      frameName: data.frameName,
      cycle: cycle,
      faculty: faculty
    }

    const studyFrame = this.studyFrameRepository.create(dataCreate);
    return this.studyFrameRepository.save(studyFrame);
  }

  async getAll(): Promise<StudyFrame[]> {
    return this.studyFrameRepository.find({ relations: ['cycle', 'faculty'] });
  }

  async getById(id: string): Promise<StudyFrame | null> {
    return this.studyFrameRepository.findOne({ where: { frameId: id } });
  }

  async update(id: string, data: any): Promise<StudyFrame | null> {
    const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: id } });
    if (!studyFrame) {
      return null;
    }
    // Tìm entity cycle
    const cycle = await this.cycleRepository.findOne({ where: { cycleId: data.cycleId } });
    if (!cycle) {
      throw new Error('StudyFrameService - update - Not found cycle');
    }

    // Tìm entity faculty update theo id
    const faculty = await this.facultyRepository.findOne({ where: { facultyId: data.facultyId } });
    if (!faculty) {
      throw new Error('StudyFrameService - update - Not found faculty');
    }

    const dataUpdate = {
      frameName: data.frameName,
      cycle: cycle,
      faculty: faculty
    }

    this.studyFrameRepository.merge(studyFrame, dataUpdate);
    return this.studyFrameRepository.save(studyFrame);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.studyFrameRepository.delete({ frameId: In(ids) });
    return result.affected !== 0;
  }


  // Gọi store lấy danh sách môn theo khung
  async GetSubjectByMajor(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { userId: userId },
        relations: ['faculty', 'major']
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
      const studyFrame = await this.studyFrameRepository.findOne({
        where: {
          faculty: user.faculty,
          cycle: cycle
        }
      }
      )

      const query = 'CALL GetSubjectByMajor(?,?)';
      const [results] = await this.dataSource.query(query,
        [user.major.majorId, studyFrame?.frameId]
      );

      // MySQL returns an array of arrays for stored procedures
      // The first element is the actual result set
      const resultSet = results[0];

      if (!resultSet || resultSet.length === 0) {
        return [];
      }
      // No need to parse JSON, as MySQL already returns it as an object
      return results;
    } catch (error) {
      console.error('Lỗi khi gọi stored procedure GetSubjectByMajor', error);
      throw new Error('Lỗi khi gọi stored procedure');
    }
  };


  // Gọi store lấy danh sách môn theo khung với userId
  async callKhungCTDT(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { userId: userId },
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
      const studyFrame = await this.studyFrameRepository.findOne({
        where: {
          faculty: user.faculty,
          cycle: cycle
        },
      }
      )

      const query = 'CALL KhungCTDT(?)';
      const [results] = await this.dataSource.query(
        query,
        [studyFrame?.frameId]
      );

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


  // Tìm khung CTĐT theo năm và khoa hoặc theo cycle
  async findKhungCTDTDepartment(startYear: number | null, facultyId: string, cycleId: string | null): Promise<StudyFrame | null> {
    try {
      let cycle;
      if (cycleId) {
        // Nếu có cycleId => tìm theo cycleId
        cycle = await this.cycleRepository.findOneBy({
          cycleId: cycleId
        });
      }

      if (startYear && facultyId) {
        // Tìm chu kỳ của user => Năm đầu tiên của niên khóa lớn hơn hoặc bằng startYear, nhỏ hơn endYear
        cycle = await this.cycleRepository.findOne({
          where: {
            startYear: LessThanOrEqual(startYear),
            endYear: MoreThan(startYear)
          },
        });
      }

      if (!cycle) {
        throw new Error('Not found entity cycle');
      }

      // Tìm khung đào tạo theo ngành và chu kỳ
      const studyFrame = await this.studyFrameRepository.findOne({
        where: {
          faculty: { facultyId: facultyId },
          cycle: cycle
        },
      })

      return studyFrame;
    } catch (error) {
      throw new Error('Lỗi khi tìm KHUNG CTDT');
    }
  }

  async callKhungCTDTDepartment(studyFrameId: string): Promise<any> {
    try {
      const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: studyFrameId } });
      if (!studyFrame) {
        throw new Error('Lỗi khi tìm KHUNG CTDT');
      }

      const query = 'CALL KhungCTDT(?)';
      const [results] = await this.dataSource.query(
        query,
        [studyFrame?.frameId]
      );

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

  async getAllComponents(): Promise<StudyFrame_Component[]> {
    return this.studyFrameComponentRepository.find({
      select: [
        'id',
        'frameComponentId',
        'frameComponentName',
        'description',
        'creditHour',
      ]
    });
  }

}
