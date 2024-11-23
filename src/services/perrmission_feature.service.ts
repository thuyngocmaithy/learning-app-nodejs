import { Repository, DataSource, FindOneOptions, In, Raw } from 'typeorm';
import { PermissionFeature } from '../entities/Permission_Feature';
import { Permission } from '../entities/Permission';
import { Feature } from '../entities/Feature';

export class PermissionFeatureService {
  private permissionFeatureRepository: Repository<PermissionFeature>;
  private permissionRepository: Repository<Permission>;
  private featureRepository: Repository<Feature>;

  constructor(dataSource: DataSource) {
    this.permissionFeatureRepository = dataSource.getRepository(PermissionFeature);
    this.permissionRepository = dataSource.getRepository(Permission);
    this.featureRepository = dataSource.getRepository(Feature);
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

  public create = async (permissionFeatureData: any): Promise<PermissionFeature> => {
    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionFeatureData.permissionId });
    if (!permission) {
      throw new Error('Invalid permission');
    }

    const feature = await this.featureRepository.findOneBy({ featureId: permissionFeatureData.featureId });
    if (!feature) {
      throw new Error('Invalid feature');
    }
    const permission_feature = this.permissionFeatureRepository.create({
      permission: permission,
      feature: feature,
      permissionDetail: permissionFeatureData.permissionDetail
    });

    const savedScientificResearch = await this.permissionFeatureRepository.save(permission_feature);
    return savedScientificResearch;
  }

  public update = async (id: string, permissionFeatureData: any): Promise<PermissionFeature | null> => {
    const permission = await this.permissionRepository.findOneBy({ permissionId: permissionFeatureData.permissionId });
    if (!permission) {
      throw new Error('Invalid permission');
    }

    const feature = await this.featureRepository.findOneBy({ featureId: permissionFeatureData.featureId });
    if (!feature) {
      throw new Error('Invalid feature');
    }

    const permission_feature = this.permissionFeatureRepository.create({
      permission: permission,
      feature: feature,
      permissionDetail: permissionFeatureData.permissionDetail
    });


    await this.permissionFeatureRepository.update(id, permission_feature);
    const options: FindOneOptions<PermissionFeature> = {
      where: { id },
      relations: ['permission', 'feature']
    };
    return this.permissionFeatureRepository.findOne(options);
  }

  public delete = async (ids: string[]): Promise<boolean> => {
    const result = await this.permissionFeatureRepository.delete({ id: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }


  async getWhere(condition: Partial<PermissionFeature>): Promise<PermissionFeature[]> {
    const whereCondition: any = {};

    if (condition.permission) {
      whereCondition.permission = { permissionId: condition.permission };
    }

    if (condition.feature) {
      whereCondition.feature = { featureId: condition.feature };
    }


    if (condition.permissionDetail) {
      // Lấy key từ permissionDetail với kiểu keyof PermissionType
      const permissionKey = Object.keys(condition.permissionDetail)[0] as keyof typeof condition.permissionDetail;

      // Lấy giá trị tương ứng với key
      const permissionValue = condition.permissionDetail[permissionKey];

      // Thêm điều kiện tìm kiếm cho permissionDetail
      whereCondition.permissionDetail = Raw(alias => `
        ${alias} ->> '${permissionKey}' = '${permissionValue}'
      `);
    }

    return this.permissionFeatureRepository.find({
      where: whereCondition,
      order: { feature: { orderNo: 'ASC' } },
      relations: ['permission', 'feature', 'feature.parent'],
    });
  }

}