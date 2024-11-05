import { Major } from './../entities/Major';
// studyFrame.service.ts
import { DataSource, In, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { StudyFrame,  StudyFrame_Component } from '../entities/StudyFrame';
import { User } from '../entities/User';
import { Cycle } from '../entities/Cycle';
import { StudyFrame_Faculty_Cycle } from '../entities/StudyFrame_Faculty_Cycle';
import { AppDataSource } from '../data-source';

export class StudyFrameService {
  private studyFrameRepository: Repository<StudyFrame>;
  private userRepository: Repository<User>;
  private cycleRepository: Repository<Cycle>;
  private studyFrame_Faculty_Cycle_Repository: Repository<StudyFrame_Faculty_Cycle>;
  private studyFrameComponentRepository: Repository<StudyFrame_Component>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.studyFrameRepository = dataSource.getRepository(StudyFrame);
    this.userRepository = AppDataSource.getRepository(User);
    this.cycleRepository = AppDataSource.getRepository(Cycle);
    this.studyFrame_Faculty_Cycle_Repository = AppDataSource.getRepository(StudyFrame_Faculty_Cycle);
    this.studyFrameComponentRepository = dataSource.getRepository(StudyFrame_Component);
    this.dataSource = dataSource;
  }

  async create(data: Partial<StudyFrame>): Promise<StudyFrame> {
    const studyFrame = this.studyFrameRepository.create(data);
    return this.studyFrameRepository.save(studyFrame);
  }

  async getAll(): Promise<StudyFrame[]> {
    return this.studyFrameRepository.find({
      relations: ['parentFrame'], //lấy cột khóa ngoại parentFrame
    });
  }

  async getById(id: string): Promise<StudyFrame | null> {
    return this.studyFrameRepository.findOne({ where: { frameId: id } });
  }

  async update(id: string, data: Partial<StudyFrame>): Promise<StudyFrame | null> {
    const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: id } });
    if (!studyFrame) {
      return null;
    }
    this.studyFrameRepository.merge(studyFrame, data);
    return this.studyFrameRepository.save(studyFrame);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.studyFrameRepository.delete({ frameId: In(ids) });
    return result.affected !== 0;
  }

  // async getStudyFrameAndSubjectByUserMajorAndFaculty(userId: string): Promise<any> {
  //   try {
  //     const query = 'CALL GetStudyFrameAndSubjectByUserMajorAndFaculty(?)';
  //     const result = await this.dataSource.query(query, [userId]);

  //     console.log('Raw result from stored procedure:', JSON.stringify(result, null, 1));

  //     // The result is now an array with a single element containing the query results
  //     const frames = result[0];
  //     return frames.map((frame: any) => {
  //       try {
  //         let parsedSubjectInfo = [];
  //         if (frame.subjectInfo) {
  //           if (Array.isArray(frame.subjectInfo) && frame.subjectInfo.length === 1 && frame.subjectInfo[0] === null) {
  //             // Handle the case where subjectInfo is [null]
  //             parsedSubjectInfo = [];
  //           } else if (typeof frame.subjectInfo === 'string') {
  //             parsedSubjectInfo = JSON.parse(frame.subjectInfo);
  //           } else if (Array.isArray(frame.subjectInfo)) {
  //             parsedSubjectInfo = frame.subjectInfo;
  //           }
  //         }
  //         return {
  //           ...frame,
  //           subjectInfo: parsedSubjectInfo
  //         };
  //       } catch (parseError) {
  //         console.error('Error processing subjectInfo:', parseError, 'Raw data:', frame.subjectInfo);
  //         return {
  //           ...frame,
  //           subjectInfo: [] // Return an empty array if processing fails
  //         };
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Error calling stored procedure GetStudyFrameAndSubjectByUserMajorAndFaculty', error);
  //     throw new Error('Error calling stored procedure');
  //   }
  // }


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
      const studyFrame_Faculty_Cycle = await this.studyFrame_Faculty_Cycle_Repository.findOne({
        where: {
          faculty: user.faculty,
          cycle: cycle
        },
        relations: ['studyFrame']
      }
      )

      const query = 'CALL GetSubjectByMajor(?,?)';
      const [results] = await this.dataSource.query(query,
        [user.major.majorId, studyFrame_Faculty_Cycle?.studyFrame.frameId]
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
      const studyFrame_Faculty_Cycle = await this.studyFrame_Faculty_Cycle_Repository.findOne({
        where: {
          faculty: user.faculty,
          cycle: cycle
        },
        relations: ['studyFrame']
      }
      )

      const query = 'CALL KhungCTDT(?)';
      const [results] = await this.dataSource.query(
        query,
        [studyFrame_Faculty_Cycle?.studyFrame.frameId]
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


  // Gọi store lấy danh sách môn theo khung bằng startYear và facultyId
  async callKhungCTDTDepartment(startYear: number | null, facultyId: string, cycleId: string | null): Promise<any> {
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
      const studyFrame_Faculty_Cycle = await this.studyFrame_Faculty_Cycle_Repository.findOne({
        where: {
          faculty: { facultyId: facultyId },
          cycle: cycle
        },
        relations: ['studyFrame']
      })

      if (!studyFrame_Faculty_Cycle) {
        return [];
      }

      const query = 'CALL KhungCTDT(?)';
      const [results] = await this.dataSource.query(
        query,
        [studyFrame_Faculty_Cycle?.studyFrame.frameId]
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
