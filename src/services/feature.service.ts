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
    const queryBuilder = this.featureRepository.createQueryBuilder('feature');

    // Xử lý điều kiện `keyRoute`
    if (condition.keyRoute !== undefined) {
      if (condition.keyRoute === 'null') {
        // Sử dụng IS NULL cho giá trị null trong SQL
        queryBuilder.andWhere('feature.keyRoute IS NULL');
      } else {
        // Xử lý các giá trị keyRoute khác không phải null
        queryBuilder.andWhere('feature.keyRoute = :keyRoute', { keyRoute: condition.keyRoute });
      }
    }

    // Xử lý điều kiện `parent`
    if (condition.parent !== undefined) {
      if (condition.parent as unknown === 'null') {
        // Sử dụng IS NULL cho giá trị null trong SQL cho parent
        queryBuilder.andWhere('feature.parentFeatureId IS NULL');
      } else if (typeof condition.parent === 'object' && 'featureId' in condition.parent) {
        // Giả sử `condition.parent` là một đối tượng và bạn cần sử dụng `featureId` của nó
        const parentFeatureId = (condition.parent as Feature).featureId;
        queryBuilder.andWhere('feature.parentFeatureId = :parentFeatureId', { parentFeatureId });
      } else {
        // Xử lý các trường hợp không mong đợi
        console.error('Điều kiện parent không hợp lệ');
      }
    }
    // Thực thi truy vấn và trả về kết quả
    return queryBuilder.getMany();
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
  // Store lấy feature theo permission
  async GetFeatureByPermission(permissionId: string): Promise<any> {
    try {
      const query = `CALL GetMenuUser('${permissionId}')`;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Lỗi khi gọi stored GetMenuUser', error);
      throw new Error('Lỗi khi gọi stored GetMenuUser');
    }
  }

}

