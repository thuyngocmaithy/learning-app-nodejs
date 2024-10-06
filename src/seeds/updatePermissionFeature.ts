import { IsNull } from 'typeorm';
import { AppDataSource } from '../data-source';
import { PermissionFeature, PermissionType } from '../entities/Permission_Feature';

export default async function updatePermissionDetail() {
    // Không cần khởi tạo lại kết nối
    const permissionFeatureRepository = AppDataSource.getRepository(PermissionFeature);

    // Tìm tất cả PermissionFeature mà permissionDetail là null
    const permissionFeatures = await permissionFeatureRepository.find({
        where: {
            permissionDetail: IsNull(),
        },
    });

    // Giá trị mặc định cho permissionDetail
    const defaultPermissionDetail = {
        [PermissionType.VIEW]: false,
        [PermissionType.ADD]: false,
        [PermissionType.EDIT]: false,
        [PermissionType.DELETE]: false,
    };

    // Cập nhật permissionDetail cho từng feature
    for (const feature of permissionFeatures) {
        feature.permissionDetail = defaultPermissionDetail;
        await permissionFeatureRepository.save(feature);
    }

    console.log(`Updated ${permissionFeatures.length} records.`);
}
