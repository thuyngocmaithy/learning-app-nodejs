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

  // Đăng ký môn học cho user
  async registerSubject(userId: string, subjectId: string, frameId: string, semesterId: string): Promise<UserRegisterSubject> {
      const user = await this.userRepository.findOne({
          where: { userId: userId },
      });
      const subject = await this.subjectRepository.findOne({
          where: { subjectId: subjectId },
      });
      const studyFrame = await this.studyFrameRepository.findOneBy({ id: frameId });
      const semester = await this.semesterRepository.findOneBy({ id: semesterId });

      if (!user || !subject || !studyFrame || !semester) {
          throw new Error('User, Subject, StudyFrame, or Semester not found');
      }

      const userRegisterSubject = this.userRegisterSubjectRepository.create({
          user,
          subject,
          studyFrame,
          semester,
      });

      return this.userRegisterSubjectRepository.save(userRegisterSubject);
  }

  // Lấy danh sách môn học đã đăng ký của user
  async getUserRegisteredSubjects(userId: string): Promise<UserRegisterSubject[]> {
    return this.userRegisterSubjectRepository.find({
      where: { user: { userId: userId } },
      relations: ['subject', 'studyFrame', 'semester'],
    });
  }
}