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
     * Khi xóa Feature, tự động xóa các bản ghi PermissionFeature liên quan.
     */
    @ManyToOne(() => Feature, data => data.featureId, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'featureId' })
    feature: Feature;

    /**
     * Quyền chi tiết (JSON)
     */
    @Column('json', { nullable: true })
    permissionDetail: Record<PermissionType, boolean>;
}


export enum PermissionType {
    VIEW = 'isView',
    ADD = 'isAdd',
    EDIT = 'isEdit',
    DELETE = 'isDelete',
}