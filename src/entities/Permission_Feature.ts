import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Permission } from './Permission';
import { Feature } from './Feature';

/**
 * Thực thể quyền - Tính năng
 */
@Entity()
@Unique(["permission", "feature"])
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
    @JoinColumn({ name: 'permissionId' })
    permission: Permission;

    /**
     * ID tính năng (tham chiếu đến thực thể Feature, không rỗng)
     */
    @ManyToOne(() => Feature, data => data.featureId, { nullable: false })
    @JoinColumn({ name: 'featureId' })
    feature: Feature;

    /**
     * Số thứ tự (không rỗng)
     */
    @Column('int', { nullable: false })
    orderNo: number;
}
