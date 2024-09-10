import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn, PrimaryColumn } from 'typeorm';
import { PermissionFeature } from './Permission_Feature';

/**
 * Thực thể Tính năng
 */
@Entity()
export class Feature {
  /**
   * Mã tính năng
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  featureId: string;

  /**
   * Tên tính năng => Tên menu (không rỗng)
   */
  @Column({ nullable: false })
  featureName: string;

  /**
   * URL (không rỗng)
   */
  @Column({ nullable: false })
  url: string;

  /**
   * keyRoute => cấu hình route FE (có thể rỗng)
   */
  @Column({ nullable: true })
  keyRoute: string;

  /**
   * icon (có thể rỗng)
   */
  @Column({ nullable: true })
  icon: string;

  /**
   * ID tính năng cha (tham chiếu đến thực thể Feature, có thể rỗng)
   */
  @ManyToOne(() => Feature, data => data.featureId, { nullable: true })
  parent: Feature;

  // Thêm cascade: true để xóa liên quan đến PermissionFeature khi xóa Follower
  @OneToMany(() => PermissionFeature, permissionFeature => permissionFeature.feature, { cascade: ['insert', 'update', 'remove'] })
  permissionFeature: PermissionFeature[];
}