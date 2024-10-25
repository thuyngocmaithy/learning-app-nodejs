import { Major } from './../entities/Major';
// studyFrame.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { StudyFrame } from '../entities/StudyFrame';

export class StudyFrameService {
  private studyFrameRepository: Repository<StudyFrame>;
  private dataSource: DataSource;


  constructor(dataSource: DataSource) {
    this.studyFrameRepository = dataSource.getRepository(StudyFrame);
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
    
    
    async GetSubjectByMajor(majorId: string): Promise<any> {
      try {
        const query = 'CALL GetSubjectByMajor(?)';
        const [results] = await this.dataSource.query(query, [majorId]);
        
        // MySQL returns an array of arrays for stored procedures
        // The first element is the actual result set
        const resultSet = results[0];
  
        if (!resultSet || resultSet.length === 0) {
          return [];
        }
        
        console.log(resultSet);

        // No need to parse JSON, as MySQL already returns it as an object
        return results;
      } catch (error) {
        console.error('Lỗi khi gọi stored procedure GetSubjectByMajor', error);
        throw new Error('Lỗi khi gọi stored procedure');
      }
    };

}
