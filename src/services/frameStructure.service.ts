// frameStructure.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { FrameStructure } from '../entities/FrameStructure';

export class FrameStructureService {
  private frameStructureRepository: Repository<FrameStructure>;

  constructor(dataSource: DataSource) {
    this.frameStructureRepository = dataSource.getRepository(FrameStructure);
  }

  async create(data: Partial<FrameStructure>): Promise<FrameStructure> {
    const frameStructure = this.frameStructureRepository.create(data);
    return this.frameStructureRepository.save(frameStructure);
  }

  async getAll(): Promise<FrameStructure[]> {
    return this.frameStructureRepository.find({
      relations:['studyFrame','studyFrameComponent','studyFrameComponentParent']
    });
  }

  async getById(id: string): Promise<FrameStructure | null> {
    return this.frameStructureRepository.findOne({ where: { id: id } });
  }

  async update(id: string, data: Partial<FrameStructure>): Promise<FrameStructure | null> {
    const frameStructure = await this.frameStructureRepository.findOne({ where: { id: id } });
    if (!frameStructure) {
      return null;
    }
    this.frameStructureRepository.merge(frameStructure, data);
    return this.frameStructureRepository.save(frameStructure);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.frameStructureRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }
}
