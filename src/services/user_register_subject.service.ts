import { DataSource, Repository } from 'typeorm';
import { UserRegisterSubject } from '../entities/User_Register_Subject';
import { User } from '../entities/User';
import { Subject } from '../entities/Subject';
import { StudyFrame } from '../entities/StudyFrame';
import { Semester } from '../entities/Semester';

export class UserRegisterSubjectService {
  private userRegisterSubjectRepository: Repository<UserRegisterSubject>;
  private userRepository: Repository<User>;
  private subjectRepository: Repository<Subject>;
  private studyFrameRepository: Repository<StudyFrame>;
  private semesterRepository: Repository<Semester>;

  constructor(dataSource: DataSource) {
    this.userRegisterSubjectRepository = dataSource.getRepository(UserRegisterSubject);
    this.userRepository = dataSource.getRepository(User);
    this.subjectRepository = dataSource.getRepository(Subject);
    this.studyFrameRepository = dataSource.getRepository(StudyFrame);
    this.semesterRepository = dataSource.getRepository(Semester);
  }

  async registerSubject(userId: string, subjectId: string, semesterId: string): Promise<UserRegisterSubject> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const subject = await this.subjectRepository.findOne({
      where: { subjectId: subjectId },
    });
    if (!subject) {
      throw new Error(`Subject with ID ${subjectId} not found`);
    }

    const semester = await this.semesterRepository.findOne({
      where: { semesterId: semesterId },
    });
    if (!semester) {
      throw new Error(`Semester with ID ${semesterId} not found`);
    }

    // Check if the user has already registered for this subject
    const existingRegistration = await this.userRegisterSubjectRepository.findOne({
      where: {
        user: { userId: userId },
        subject: { subjectId: subjectId },
      },
    });

    if (existingRegistration) {
      throw new Error(`User has already registered for subject ${subjectId}`);
    }

    const userRegisterSubject = this.userRegisterSubjectRepository.create({
      user,
      subject,
      semester,
    });

    return this.userRegisterSubjectRepository.save(userRegisterSubject);
  }

  async getUserRegisteredSubjects(userId: string): Promise<UserRegisterSubject[]> {
    return this.userRegisterSubjectRepository.find({
      where: { user: { userId: userId } },
      relations: ['subject', 'semester'],
    });
  }
}