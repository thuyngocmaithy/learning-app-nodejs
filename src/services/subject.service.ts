// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Subject } from '../entities/Subject';
import { Subject_StudyFrameComp } from '../entities/Subject_StudyFrameComp';
import { User } from '../entities/User';

export class SubjectService {
  private subjectRepository: Repository<Subject>;
  private dataSource: DataSource;


  constructor(dataSource: DataSource) {
    this.subjectRepository = dataSource.getRepository(Subject);
    this.dataSource = dataSource;
  }

  async create(data: Partial<Subject> & { frameComponentName?: string, majorId?: string }): Promise<Subject> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const subject = this.subjectRepository.create(data);
      const savedSubject = await queryRunner.manager.save(Subject, subject);

      await queryRunner.commitTransaction();
      return savedSubject;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(subjectIds: string[]): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Subject_StudyFrameComp, {
        subject: { subjectId: In(subjectIds) }
      });

      const result = await queryRunner.manager.delete(Subject, {
        subjectId: In(subjectIds)
      });

      await queryRunner.commitTransaction();
      return result.affected !== 0;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(): Promise<Subject[]> {
    return this.subjectRepository.find({
      order: { createDate: 'DESC' },
      relations: ['subjectBefore']
    });
  }

  async getById(subjectId: string): Promise<Subject | null> {
    const options: FindOneOptions<Subject> = { where: { subjectId }, relations: ['subjectBefore'] };
    return await this.subjectRepository.findOne(options);
  }

  async update(subjectId: string, data: Partial<Subject> & { frameComponentName?: string, majorId?: string }): Promise<Subject | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update the subject
      const subject = await this.subjectRepository.findOne({ where: { subjectId } });
      if (!subject) return null;

      this.subjectRepository.merge(subject, data);
      const updatedSubject = await queryRunner.manager.save(Subject, subject);

      await queryRunner.commitTransaction();
      return updatedSubject;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }



  async getSubjectByFacultyId(facultyId: string): Promise<Subject[]> {
    try {
      const subjects = await this.dataSource.query('CALL GetSubjectsByFaculty(?)', [facultyId]);
      return subjects; // Adapt based on how the result is returned
    } catch (error) {
      console.error('Error fetching subjects by faculty ID:', error);
      throw new Error('Unable to fetch subjects. Please try again later.'); // Optionally, you can throw a custom error
    }
  }

  async getAllSubjectDetail(): Promise<Subject[]> {
    try {
      const subjects = await this.dataSource.query('CALL GetSubjectsWithDetails()');
      return subjects;
    }
    catch (error) {
      console.error('Error fetching subject Detail:', error);
      throw new Error('Unable to fetch subjects. Please try again later.'); // Optionally, you can throw a custom error
    }
  }
  async getWhere(condition: any): Promise<any[]> {
    const queryBuilder = this.dataSource.createQueryBuilder()
      .select([
        's.subjectId AS subjectId',
        's.subjectName as subjectName',
        's.creditHour as creditHour',
        's.isCompulsory as isCompulsory',
        'sb.subjectId AS subjectBefore',
        'se.subjectId AS subjectEqual',
        's.createDate as createDate',
        's.createUserId as createUserId',
        's.lastModifyDate as lastModifyDate',
        's.lastModifyUserId as lastModifyUserId',
      ])
      .from(Subject, 's')
      .leftJoin('s.subjectBefore', 'sb')
      .leftJoin('s.subjectEqual', 'se')

    // Add conditions dynamically
    if (condition.subjectId) {
      queryBuilder.andWhere('s.subjectId LIKE :subjectId', { subjectId: `%${condition.subjectId}%` });
    }

    if (condition.subjectName) {
      queryBuilder.andWhere('s.subjectName LIKE :subjectName', { subjectName: `%${condition.subjectName}%` });
    }

    if (condition.creditHour) {
      queryBuilder.andWhere('s.creditHour = :creditHour', { creditHour: condition.creditHour });
    }

    if (condition.isCompulsory !== undefined) {
      queryBuilder.andWhere('s.isCompulsory = :isCompulsory', { isCompulsory: condition.isCompulsory });
    }

    if (condition.subjectBeforeId) {
      queryBuilder.andWhere('sb.subjectId = :subjectBeforeId', { subjectBeforeId: condition.subjectBeforeId });
    }

    if (condition.frameComponentId) {
      queryBuilder.andWhere('sfc.frameComponentId = :frameComponentId', { frameComponentId: condition.frameComponentId });
    }

    queryBuilder.groupBy('s.subjectId'); // Đảm bảo mỗi môn học chỉ xuất hiện một lần

    // Execute the query
    return queryBuilder.getRawMany();
  }

  async importSubject(data: any[], createUserId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Validate createUser
      const createUser = await queryRunner.manager.findOne(User, {
        where: { userId: createUserId },
      });
  
      if (!createUser) {
        throw new Error(`Không tìm thấy người dùng với ID: ${createUserId}`);
      }
  
      const subjectsToSave = await Promise.all(
        data.map(async (row) => {
          const [subjectId, subjectName, creditHour, isCompulsory, subjectBeforeId, subjectEqualId] = row;
  
          // Kiểm tra xem môn học đã tồn tại chưa
          const existingSubject = await queryRunner.manager.findOne(Subject, {
            where: { subjectId: String(subjectId) },
          });
  
          if (existingSubject) {
            // Nếu tồn tại, cập nhật thông tin môn học
            existingSubject.subjectName = subjectName;
            existingSubject.creditHour = Number(creditHour);
            existingSubject.isCompulsory = isCompulsory === 'true' || isCompulsory === true;
  
            // Cập nhật môn học trước
            if (subjectBeforeId) {
              const subjectBefore = await queryRunner.manager.findOne(Subject, {
                where: { subjectId: subjectBeforeId },
              });
              existingSubject.subjectBefore = subjectBefore || null;
            } else {
              existingSubject.subjectBefore = null;
            }
  
            // Cập nhật môn học tương đương
            existingSubject.subjectEqual = subjectEqualId ? String(subjectEqualId) : null;
  
            existingSubject.lastModifyUser = createUser;
            return existingSubject;
          } else {
            // Nếu không tồn tại, tạo môn học mới
            const subject = new Subject();
            subject.subjectId = String(subjectId);
            subject.subjectName = subjectName;
            subject.creditHour = Number(creditHour);
            subject.isCompulsory = isCompulsory === 'true' || isCompulsory === true;
  
            // Xử lý môn học trước
            if (subjectBeforeId) {
              const subjectBefore = await queryRunner.manager.findOne(Subject, {
                where: { subjectId: subjectBeforeId },
              });
              subject.subjectBefore = subjectBefore || null;
            } else {
              subject.subjectBefore = null;
            }
  
            // Xử lý môn học tương đương
            subject.subjectEqual = subjectEqualId ? String(subjectEqualId) : null;
  
            // Set thông tin người tạo và chỉnh sửa
            subject.createUser = createUser;
            subject.lastModifyUser = createUser;
  
            return subject;
          }
        })
      );
  
      // Lưu các môn học vào database
      await queryRunner.manager.save(Subject, subjectsToSave);
  
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


}
