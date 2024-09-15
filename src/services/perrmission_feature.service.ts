import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { PermissionFeature } from '../entities/Permission_Feature';

export class PermissionFeatureService {
  private permissionFeatureRepository: Repository<PermissionFeature>;

  constructor(dataSource: DataSource) {
    this.permissionFeatureRepository = dataSource.getRepository(PermissionFeature);
  }

  public getAll = async (): Promise<PermissionFeature[]> => {
    return this.permissionFeatureRepository.find({
      relations: ['permission', 'feature']
    });
  }

  public getById = async (id: string): Promise<PermissionFeature | null> => {
    const options: FindOneOptions<PermissionFeature> = {
      where: { id },
      relations: ['permission', 'feature']
    };
    return this.permissionFeatureRepository.findOne(options);
  }

  public create = async (permissionFeatureData: Partial<PermissionFeature>): Promise<PermissionFeature> => {
    const permissionFeature = this.permissionFeatureRepository.create(permissionFeatureData);
    return this.permissionFeatureRepository.save(permissionFeature);
  }

  public update = async (id: string, permissionFeatureData: Partial<PermissionFeature>): Promise<PermissionFeature | null> => {
    await this.permissionFeatureRepository.update(id, permissionFeatureData);
    const options: FindOneOptions<PermissionFeature> = {
      where: { id },
      relations: ['permission', 'feature']
    };
    return this.permissionFeatureRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.permissionFeatureRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  // async getWhere(condition: Partial<PermissionFeature>): Promise<PermissionFeature[]> {
  //   return this.permissionFeatureRepository.find({ where: condition, relations: ['permission', 'feature'] });
  // }

  async getWhere(condition: Partial<PermissionFeature>): Promise<PermissionFeature[]> {
    const whereCondition: any = {};

    if (condition.permission) {
      whereCondition.permission = { permissionId: condition.permission };
    }

    if (condition.feature) {
      whereCondition.feature = { featureId: condition.feature };
    }

    return this.permissionFeatureRepository.find({
      where: whereCondition,
      relations: ['permission', 'feature', 'feature.parent'],
    });
  }

}