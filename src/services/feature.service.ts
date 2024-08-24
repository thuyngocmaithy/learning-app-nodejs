// feature.service.ts
import { DataSource, Repository } from 'typeorm';
import { Feature } from '../entities/Feature';

export class FeatureService {
  private featureRepository: Repository<Feature>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.featureRepository = dataSource.getRepository(Feature);
    this.dataSource = dataSource;
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

  async getWhere(condition: Partial<Feature>): Promise<Feature[]> {
    return this.featureRepository.find({ where: condition, relations: ['parent'] });
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

  // Store lấy feature theo cấu trúc parent - children
  async GetFeatureByStructure(): Promise<any> {
    try {
      const query = 'CALL GetFeatureByStructure()';
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Lỗi khi gọi stored GetFeatureByStructure', error);
      throw new Error('Lỗi khi gọi stored GetFeatureByStructure');
    }
  }


}

