// studyFrame.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { Major } from '../entities/Major';

export class StudyFrame_ComponentService {
  private studyFrameRepository: Repository<StudyFrame_Component>;
  private majorRepository: Repository<Major>;

  constructor(dataSource: DataSource) {
    this.studyFrameRepository = dataSource.getRepository(StudyFrame_Component);
    this.majorRepository = dataSource.getRepository(Major);
  }

  async create(data: any): Promise<StudyFrame_Component> {
    let major;
    if (data.majorId) {
      major = await this.majorRepository.findOne({ where: { majorId: data.majorId } });
      if (!major) {
        throw new Error('Invalid major ID');
      }
    }
    else {
      major = undefined;
    }
    const studyFrame_component = this.studyFrameRepository.create({
      frameComponentId: data.frameComponentId,
      frameComponentName: data.frameComponentName,
      description: data.description,
      creditHour: data.creditHour,
      major: major
    });

    const savedStudyFrame = await this.studyFrameRepository.save(studyFrame_component);
    return savedStudyFrame;
  }

  async getAll(): Promise<StudyFrame_Component[]> {
    return this.studyFrameRepository.find({ relations: ["major"] });
  }

  async getById(id: string): Promise<StudyFrame_Component | null> {
    return this.studyFrameRepository.findOne({ where: { frameComponentId: id } });
  }

  async update(id: string, data: any): Promise<StudyFrame_Component | null> {
    const studyFrame = await this.studyFrameRepository.findOne({ where: { frameComponentId: id } });
    if (!studyFrame) {
      return null;
    }
    if (data.majorId) {
      var major = await this.majorRepository.findOne({ where: { majorId: data.majorId } });
      if (!major) {
        throw new Error('Invalid major ID');
      }
      data.major = major;
    }
    else {
      data.major = null;
    }

    this.studyFrameRepository.merge(studyFrame, data);
    return this.studyFrameRepository.save(studyFrame);
  }

  async delete(ids: string[]): Promise<boolean> {
    // Xóa trong studyFrame_component
    const result = await this.studyFrameRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }
}
