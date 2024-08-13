import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Permission } from './Permission';

/**
 * Thực thể Tính năng
 */
@Entity()
export class Feature {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã tính năng (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  featureId: string;

  /**
   * Tên tính năng (không rỗng)
   */
  @Column({ nullable: false })
  featureName: string;

  /**
   * URL (không rỗng)
   */
  @Column({ nullable: false })
  url: string;

  /**
   * ID tính năng cha (tham chiếu đến thực thể Feature, có thể rỗng)
   */
  @ManyToOne(() => Feature, data => data.featureId, { nullable: true })
  @JoinColumn({ name: 'parentFeatureID', referencedColumnName: 'featureId' })
  parentFeatureID: Feature;
}