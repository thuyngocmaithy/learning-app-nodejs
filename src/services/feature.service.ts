// feature.service.ts
import { DataSource, Repository } from 'typeorm';
import { Feature } from '../entities/Feature';

export class FeatureService {
  private featureRepository: Repository<Feature>;

  constructor(dataSource: DataSource) {
    this.featureRepository = dataSource.getRepository(Feature);
  }

  async create(data: Partial<Feature>): Promise<Feature> {
    const feature = this.featureRepository.create(data);
    return this.featureRepository.save(feature);
  }

  async getAll(): Promise<Feature[]> {
    return this.featureRepository.find({ relations: ['parent'] });
  }

  async getById(featureId: string): Promise<Feature | null> {
    return this.featureRepository.findOne({ where: { featureId }, relations: ['parent'] });
  }

  async update(featureId: string, data: Partial<Feature>): Promise<Feature | null> {
    const feature = await this.featureRepository.findOne({ where: { featureId }, relations: ['parent'] });
    if (!feature) {
      return null;
    }
    this.featureRepository.merge(feature, data);
    return this.featureRepository.save(feature);
  }

  async delete(featureId: string): Promise<boolean> {
    const result = await this.featureRepository.delete({ featureId });
    return result.affected !== 0;
  }
}