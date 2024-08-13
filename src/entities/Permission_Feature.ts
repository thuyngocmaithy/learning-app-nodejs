import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Permission } from './Permission';
import { Feature } from './Feature';

/**
 * Thực thể quyền - Tính năng
 */
@Entity()
export class PermissionFeature {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID quyền (tham chiếu đến thực thể Permission, không rỗng)
     */
    @ManyToOne(() => Permission, data => data.permissionId, { nullable: false })
    permission: Permission;

    /**
     * ID tính năng (tham chiếu đến thực thể Feature, không rỗng)
     */
    @ManyToOne(() => Feature, data => data.featureId, { nullable: false })
    feature: Feature;

    /**
     * Số thứ tự (không rỗng)
     */
    @Column('int', { nullable: false })
    orderNo: number;
}
