// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { Cycle } from '../entities/Cycle';
import { StudyFrame_Faculty_Cycle } from '../entities/StudyFrame_Faculty_Cycle';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { Subject_StudyFrameComp_Major } from '../entities/Subject_StudyFrameComp_Major';

export class SubjectService {
  private subjectRepository: Repository<Subject>;
  private userRepository: Repository<User>;
  private cycleRepository: Repository<Cycle>;
  private studyFrame_Faculty_Cycle_Repository: Repository<StudyFrame_Faculty_Cycle>;
  private studyFrameComponentRepository: Repository<StudyFrame_Component>;
  private Subject_StudyFrameComp_Major_Repository: Repository<Subject_StudyFrameComp_Major>;
  private dataSource: DataSource;


  constructor(dataSource: DataSource) {
    this.subjectRepository = dataSource.getRepository(Subject);
    this.userRepository = AppDataSource.getRepository(User);
    this.cycleRepository = AppDataSource.getRepository(Cycle);
    this.studyFrame_Faculty_Cycle_Repository = AppDataSource.getRepository(StudyFrame_Faculty_Cycle);
    this.studyFrameComponentRepository = dataSource.getRepository(StudyFrame_Component);
    this.Subject_StudyFrameComp_Major_Repository = dataSource.getRepository(Subject_StudyFrameComp_Major);
    this.dataSource = dataSource;
  }

  async create(data: Partial<Subject> & { frameComponentName?: string, majorId?: string }): Promise<Subject> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      const subject = this.subjectRepository.create(data);
      const savedSubject = await queryRunner.manager.save(Subject, subject);

     
      if (data.frameComponentName) {
        
        const frameComponent = await this.studyFrameComponentRepository.findOne({
          where: { frameComponentId: data.frameComponentName }
        });

        if (frameComponent) {
          const relation = new Subject_StudyFrameComp_Major();
          relation.subject = savedSubject;
          relation.studyFrameComponent = frameComponent;
          
          // Add major if provided
          if (data.majorId) {
            relation.major = { majorId: data.majorId } as any;
          }

          await queryRunner.manager.save(Subject_StudyFrameComp_Major, relation);
        }
      }

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
      await queryRunner.manager.delete(Subject_StudyFrameComp_Major, {
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

      // Update or create the relation
      if (data.frameComponentName) {
        // Find existing relation
        const existingRelation = await this.Subject_StudyFrameComp_Major_Repository.findOne({
          where: { subject: { subjectId } }
        });

        const frameComponent = await this.studyFrameComponentRepository.findOne({
          where: { frameComponentId: data.frameComponentName }
        });

        if (frameComponent) {
          if (existingRelation) {
            // Update existing relation
            existingRelation.studyFrameComponent = frameComponent;
            if (data.majorId) {
              existingRelation.major = { majorId: data.majorId } as any;
            }
            await queryRunner.manager.save(Subject_StudyFrameComp_Major, existingRelation);
          } else {
            // Create new relation
            const newRelation = new Subject_StudyFrameComp_Major();
            newRelation.subject = updatedSubject;
            newRelation.studyFrameComponent = frameComponent;
            if (data.majorId) {
              newRelation.major = { majorId: data.majorId } as any;
            }
            await queryRunner.manager.save(Subject_StudyFrameComp_Major, newRelation);
          }
        }
      }

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
    try{
      const subjects = await this.dataSource.query('CALL GetSubjectsWithDetails()');
      return subjects;
    } 
    catch(error){
      console.error('Error fetching subject Detail:', error);
      throw new Error('Unable to fetch subjects. Please try again later.'); // Optionally, you can throw a custom error
    }
  }
}
