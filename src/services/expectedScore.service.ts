import { Repository, DataSource, FindOneOptions, In, Not } from 'typeorm';
import { ExpectedScore } from '../entities/ExpectedScore';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';

export class ExpectedScoreService {
  private expectedScoreRepository: Repository<ExpectedScore>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.expectedScoreRepository = dataSource.getRepository(ExpectedScore);
    this.dataSource = dataSource;
  }

  public getAll = async (): Promise<ExpectedScore[]> => {
    return this.expectedScoreRepository.find({
      relations: ['subject', 'student'],
    });
  };

  public getById = async (id: string): Promise<ExpectedScore | null> => {
    const options: FindOneOptions<ExpectedScore> = {
      where: { id },
      relations: ['subject', 'student'],
    };
    return this.expectedScoreRepository.findOne(options);
  };

  public create = async (expectedScoreData: Partial<ExpectedScore>): Promise<ExpectedScore> => {
    // Kiểm tra dữ liệu đầu vào
    if (!expectedScoreData.student?.userId || !expectedScoreData.subject?.subjectId) {
        throw new Error('Student and Subject information are required');
    }

    // Kiểm tra xem đã tồn tại bản ghi với cùng studentId và subjectId chưa
    const existingRecord = await this.expectedScoreRepository.findOne({
        where: {
            student: { userId: expectedScoreData.student.userId },
            subject: { subjectId: expectedScoreData.subject.subjectId }
        },
        relations: ['subject', 'student'],
    });

    if (existingRecord) {
        // Nếu đã tồn tại, cập nhật bản ghi đó
        const updatedRecord = {
            ...existingRecord,
            ...expectedScoreData,
            id: existingRecord.id // Giữ nguyên id cũ
        };
        return this.expectedScoreRepository.save(updatedRecord);
    }

    // Nếu chưa tồn tại, tạo mới
    const expectedScore = this.expectedScoreRepository.create(expectedScoreData);
    return this.expectedScoreRepository.save(expectedScore);
};


  public update = async (id: string, expectedScoreData: Partial<ExpectedScore>): Promise<ExpectedScore | null> => {
    // Kiểm tra xem bản ghi cần update có tồn tại không
    const existingRecord = await this.expectedScoreRepository.findOne({
      where: { id },
      relations: ['subject', 'student'],
    });

    if (!existingRecord) {
      return null;
    }

    // Nếu có thay đổi về student hoặc subject, kiểm tra xem có trùng lặp không
    if (expectedScoreData.student || expectedScoreData.subject) {
      const studentId = expectedScoreData.student?.userId || existingRecord.student.userId;
      const subjectId = expectedScoreData.subject?.subjectId || existingRecord.subject.subjectId;

      const duplicateRecord = await this.expectedScoreRepository.findOne({
        where: {
          student: { userId: studentId },
          subject: { subjectId: subjectId },
          id: Not(id) // Loại trừ bản ghi hiện tại
        },
        relations: ['subject', 'student'],
      });

      if (duplicateRecord) {
        throw new Error('Đã tồn tại bản ghi với student và subject này');
      }
    }

    // Cập nhật bản ghi
    const updatedRecord = {
      ...existingRecord,
      ...expectedScoreData,
    };

    return this.expectedScoreRepository.save(updatedRecord);
  };

  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.expectedScoreRepository.delete({ id: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  };

  public getExpectedScoreByStudentId = async (studentId: string): Promise<ExpectedScore[]> => {
    return this.expectedScoreRepository.find({
      where: { student: { userId: studentId } },
      relations: ['subject', 'student'],
    });
  };

  public getExpectedScoreByStudentIdAndSubjectId = async (
    studentId: string,
    subjectId: string
  ): Promise<ExpectedScore | null> => {
    return this.expectedScoreRepository.findOne({
      where: {
        student: { userId: studentId },
        subject: { subjectId: subjectId }
      },
      relations: ['subject', 'student'],
    });
  };


  public deleteBySubjectsAndStudent = async (subjectId: string, studentId: string): Promise<boolean> => {
    const result = await this.expectedScoreRepository.delete({
      subject: { subjectId: subjectId },
      student: { userId: studentId }
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  };

}