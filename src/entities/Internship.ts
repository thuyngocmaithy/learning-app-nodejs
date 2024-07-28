import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from './User';

/**
 * Thực thể Thực tập
 */
@Entity()
export class Internship {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tiêu đề (không rỗng)
   */
  @Column({ nullable: false })
  title: string;

  /**
   * Địa điểm (không rỗng)
   */
  @Column({ nullable: false })
  location: string;

  /**
   * Lương (không rỗng)
   */
  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  salary: number;

  /**
   * Số lượng thực tập sinh (không rỗng)
   */
  @Column('int', { nullable: false })
  internNumber: number;

  /**
   * Loại hình (không rỗng)
   */
  @Column({ nullable: false })
  type: string;

  /**
   * Mô tả (không rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Yêu cầu (không rỗng)
   */
  @Column({ nullable: false })
  require: string;

  /**
   * Lợi ích (không rỗng)
   */
  @Column({ nullable: false })
  benefit: string;

  /**
   * ID người tạo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: true })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}