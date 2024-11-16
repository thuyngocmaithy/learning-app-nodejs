// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Subject } from '../entities/Subject';
import { Subject_StudyFrameComp } from '../entities/Subject_StudyFrameComp';

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
    return this.subjectRepository.find({ relations: ['createUser', 'lastModifyUser', 'subjectBefore'] });
  }

  async getById(subjectId: string): Promise<Subject | null> {
    const options: FindOneOptions<Subject> = { where: { subjectId }, relations: ['createUser', 'lastModifyUser', 'subjectBefore'] };
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
}
