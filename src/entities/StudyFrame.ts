import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { Subject } from './Subject';


/**
 * Thực thể Khung đào tạo
 */
@Entity()
export class StudyFrame {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tên khung (không rỗng)
   */
  @Column({ nullable: false })
  frameName: string;

  /**
   * Mô tả (không rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Số khung (không rỗng)
   */
  @Column('int', { nullable: false })
  frameNumber: number;
}