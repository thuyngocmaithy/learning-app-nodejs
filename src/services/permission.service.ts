import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Permission } from '../entities/Permission';

export class PermissionService {
  private permissionRepository: Repository<Permission>;

  constructor(dataSource: DataSource) {
    this.permissionRepository = dataSource.getRepository(Permission);
  }

  public getAll = async (): Promise<Permission[]> => {
    return this.permissionRepository.find();
  }

  public getByPermissionId = async (permissionId: string): Promise<Permission | null> => {
    const options: FindOneOptions<Permission> = { where: { permissionId } };
    return this.permissionRepository.findOne(options);
  }

  public create = async (permissionData: Partial<Permission>): Promise<Permission> => {
    const permission = this.permissionRepository.create(permissionData);
    return this.permissionRepository.save(permission);
  }

  public update = async (permissionId: string, permissionData: Partial<Permission>): Promise<Permission | null> => {
    await this.permissionRepository.update(permissionId, permissionData);
    const options: FindOneOptions<Permission> = { where: { permissionId } };
    return this.permissionRepository.findOne(options);
  }

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.permissionRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}