// frameStructure.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Subject_StudyFrameComp_Major } from '../entities/Subject_StudyFrameComp_Major';

export class Subject_StudyFrameComp_MajorService {
  private subject_studyFrameComp_majorRepository: Repository<Subject_StudyFrameComp_Major>;

  constructor(dataSource: DataSource) {
    this.subject_studyFrameComp_majorRepository = dataSource.getRepository(Subject_StudyFrameComp_Major);
  }

  async create(data: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major> {
    const frameStructure = this.subject_studyFrameComp_majorRepository.create(data);
    return this.subject_studyFrameComp_majorRepository.save(frameStructure);
  }

  async getAll(): Promise<Subject_StudyFrameComp_Major[]> {
    return this.subject_studyFrameComp_majorRepository.find({
      relations:['subject','major','studyFrameComponent']
    });
  }

  async getById(id: string): Promise<Subject_StudyFrameComp_Major | null> {
    return this.subject_studyFrameComp_majorRepository.findOne({ where: { id: id } });
  }

  async update(id: string, data: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major | null> {
    const frameStructure = await this.subject_studyFrameComp_majorRepository.findOne({ where: { id: id } });
    if (!frameStructure) {
      return null;
    }
    this.subject_studyFrameComp_majorRepository.merge(frameStructure, data);
    return this.subject_studyFrameComp_majorRepository.save(frameStructure);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.subject_studyFrameComp_majorRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }

  async getWhere(condition: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major[]> {
    const whereCondition: any = {};

    if (condition.major) {
      whereCondition.major = { majorId: condition.major }
    }

    if (condition.studyFrameComponent) {
      whereCondition.studyFrameComponent = { frameComponentId: condition.studyFrameComponent }
    }

    if (condition.subject) {
      whereCondition.subject = {subjectId: condition.subject}
    }

    return this.subject_studyFrameComp_majorRepository.find({
      where: whereCondition,
      relations: ['major', 'studyFrameComponent', 'subject']
    });
  }
}
