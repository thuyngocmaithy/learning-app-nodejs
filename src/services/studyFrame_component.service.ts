// studyFrame.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { User } from '../entities/User';
import { Cycle } from '../entities/Cycle';
import { AppDataSource } from '../data-source';

export class StudyFrame_ComponentService {
  private studyFrameRepository: Repository<StudyFrame_Component>;

  constructor(dataSource: DataSource) {
    this.studyFrameRepository = dataSource.getRepository(StudyFrame_Component);
  }

  async create(data: Partial<StudyFrame_Component>): Promise<StudyFrame_Component> {
    const studyFrame = this.studyFrameRepository.create(data);
    return this.studyFrameRepository.save(studyFrame);
  }

  async getAll(): Promise<StudyFrame_Component[]> {
    return this.studyFrameRepository.find();
  }

  async getById(id: string): Promise<StudyFrame_Component | null> {
    return this.studyFrameRepository.findOne({ where: { id: id } });
  }

  async update(id: string, data: Partial<StudyFrame_Component>): Promise<StudyFrame_Component | null> {
    const studyFrame = await this.studyFrameRepository.findOne({ where: { id: id } });
    if (!studyFrame) {
      return null;
    }
    this.studyFrameRepository.merge(studyFrame, data);
    return this.studyFrameRepository.save(studyFrame);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.studyFrameRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }
}
