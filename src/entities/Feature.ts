import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn, PrimaryColumn } from 'typeorm';
import { Permission } from './Permission';

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
  parent: Feature;
}