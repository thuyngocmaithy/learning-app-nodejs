// studyFrame.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { StudyFrame } from '../entities/StudyFrame';

export class StudyFrameService {
  private studyFrameRepository: Repository<StudyFrame>;

  constructor(dataSource: DataSource) {
    this.studyFrameRepository = dataSource.getRepository(StudyFrame);
  }

  async create(data: Partial<StudyFrame>): Promise<StudyFrame> {
    const studyFrame = this.studyFrameRepository.create(data);
    return this.studyFrameRepository.save(studyFrame);
  }

  async getAll(): Promise<StudyFrame[]> {
    return this.studyFrameRepository.find({
      relations: ['parentFrame'], //lấy cột khóa ngoại parentFrame
    });
  }

  async getById(id: string): Promise<StudyFrame | null> {
    return this.studyFrameRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<StudyFrame>): Promise<StudyFrame | null> {
    const studyFrame = await this.studyFrameRepository.findOne({ where: { id } });
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
