import { Repository, DataSource, FindOneOptions, In, getRepository } from 'typeorm';
import { Score, ComponentScore } from '../entities/Score';
import { Semester } from '../entities/Semester';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { StudyFrame_Component } from '../entities/StudyFrame';
interface SubjectInfo {
  subjectId: string;
  subjectName: string;
  creditHour: number;
  isCompulsory: boolean;
}

interface FrameComponentResponse {
  id: string;
  frameComponentId: string;
  frameComponentName: string;
  description: string;
  creditHour: string;
  subjectInfo?: SubjectInfo[];
}
export class ScoreService {
  

  private scoreRepository: Repository<Score>;
  private componentScoreRepository: Repository<ComponentScore>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.scoreRepository = dataSource.getRepository(Score);
    this.componentScoreRepository = dataSource.getRepository(ComponentScore);
    this.dataSource = dataSource;
  }

  public getAll = async (): Promise<Score[]> => {
    return this.scoreRepository.find({
      relations: ['subject', 'student', 'semester'],
    });
  };

  public getById = async (id: string): Promise<Score | null> => {
    const options: FindOneOptions<Score> = {
      where: { id },
      relations: ['subject', 'student', 'semester'],
    };
    return this.scoreRepository.findOne(options);
  };

  public create = async (scoreData: Partial<Score>): Promise<Score> => {
    const score = this.scoreRepository.create(scoreData);
    return this.scoreRepository.save(score);
  };

  public update = async (id: string, scoreData: Partial<Score>): Promise<Score | null> => {
    await this.scoreRepository.update(id, scoreData);
    const options: FindOneOptions<Score> = {
      where: { id },
      relations: ['subject', 'student', 'semester'],
    };
    return this.scoreRepository.findOne(options);
  };

  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.scoreRepository.delete({ id: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  };

  public getScoreByStudentId = async (studentId: string): Promise<Score[]> => {
    const scores = await this.scoreRepository.find({
      where: { student: { userId: studentId } },
      relations: ['subject', 'semester'],
    });

    const uniqueScores = scores.filter((score, index, self) =>
      index === self.findIndex((s) => (
        s.subject.subjectId === score.subject.subjectId &&
        s.semester.semesterId === score.semester.semesterId
      ))
    );

    return uniqueScores;
  };



  public getScoreByStudentIdAndSemesterId = async (
    studentId: string,
    semesterId: string
  ): Promise<Score[]> => {
    return this.scoreRepository.find({
      where: { student: { userId: studentId }, semester: { semesterId: semesterId } },
      relations: ['subject', 'student', 'semester'],
    });
  };

  public getScoreByStudentIdAndSubjectId = async (
    studentId: string,
    subjectId: string
  ): Promise<Score | null> => {
    return this.scoreRepository.findOne({
      where: { student: { userId: studentId }, subject: { subjectId: subjectId } },
      relations: ['subject', 'student', 'semester'],
    });
  };

  async getUserScore(): Promise<any> {
    try {
      const query = 'CALL getUserScore()';
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Lỗi khi gọi stored procedure getUserScore', error);
      throw new Error('Lỗi khi gọi stored procedure');
    }
  }


  

  public getStudentFrameScores = async (studentId: string): Promise<FrameComponentResponse[]> => {
    try {
      const frameComponentRepo = getRepository(StudyFrame_Component);
      const frameComponents = await frameComponentRepo.find();
  
      const scores = await getRepository(Score).find({
        where: { student: { userId: studentId } },
        relations: ['subject', 'semester'],
      });
  
      const subjects = await getRepository(Subject).find();
      const subjectsByFrame = new Map<string, SubjectInfo[]>();
  
      const findFrameComponentForSubject = (subject: Subject): string | null => {
        if (subject.isCompulsory) {
          return 'COMPULSORY';
        }
        return 'ELECTIVE';
      };
  
      subjects.forEach(subject => {
        const frameComponentId = findFrameComponentForSubject(subject);
        if (frameComponentId) {
          if (!subjectsByFrame.has(frameComponentId)) {
            subjectsByFrame.set(frameComponentId, []);
          }
          
          const score = scores.find(s => s.subject.subjectId === subject.subjectId);
          
          subjectsByFrame.get(frameComponentId)?.push({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            creditHour: subject.creditHour,
            isCompulsory: subject.isCompulsory,
          });
        }
      });
  
      const response: FrameComponentResponse[] = frameComponents.map(component => ({
        id: component.id,
        frameComponentId: component.frameComponentId,
        frameComponentName: component.frameComponentName,
        description: component.description,
        creditHour: component.creditHour,
        subjectInfo: subjectsByFrame.get(component.frameComponentId) || [],
      }));
  
      // Vì không có cấu trúc parent-child, trả về response trực tiếp
      return response;
  
    } catch (error) {
      console.error('Error in getStudentFrameScores:', error);
      throw error;
    }
};
}