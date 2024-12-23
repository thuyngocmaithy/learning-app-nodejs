import { Repository, DataSource, FindOneOptions, Like, In } from 'typeorm';
import { Permission } from '../entities/Permission';
import { Account } from '../entities/Account';
import { PermissionFeature } from '../entities/Permission_Feature';

export class PermissionService {
	private permissionRepository: Repository<Permission>;
	private accountRepository: Repository<Account>;
	private permissionFeatureRepository: Repository<PermissionFeature>;

	constructor(dataSource: DataSource) {
		this.permissionRepository = dataSource.getRepository(Permission);
		this.accountRepository = dataSource.getRepository(Account);
		this.permissionFeatureRepository = dataSource.getRepository(PermissionFeature);
	}

	public getAll = async (): Promise<Permission[]> => {
		return this.permissionRepository.find({ order: { createDate: "DESC" } });
	}

	async getById(permissionId: string): Promise<Permission | null> {
		return this.permissionRepository.findOne({
			order: { createDate: "DESC" },
			where: { permissionId: permissionId }
		});
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

	public delete = async (ids: string[]): Promise<boolean> => {
		const result = await this.permissionRepository.delete({ permissionId: In(ids) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}

	async checkRelatedData(ids: string[]): Promise<{ success: boolean; message?: string }> {
		const relatedRepositories = [
			{ repo: this.accountRepository, name: 'dữ liệu tài khoản' },
			{ repo: this.permissionFeatureRepository, name: 'dữ liệu phân quyền' },
		];
		// Lặp qua tất cả các bảng quan hệ để kiểm tra dữ liệu liên kết
		for (const { repo, name } of relatedRepositories) {
			const count = await repo.count({ where: { permission: { permissionId: In(ids) } } });

			if (count > 0) {
				return {
					success: false,
					message: `Quyền đang được sử dụng trong ${name}. Bạn có chắc chắn xóa?`,
				};
			}
		}


		return { success: true };
	}
}