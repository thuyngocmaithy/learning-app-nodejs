import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Faculty } from './Faculty';
import { Status } from './Status';

/**
 * Thực thể khóa luận
 */
@Entity()
export class Thesis {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tiêu đề khóa luận (không rỗng)
   */
  @Column({ nullable: false })
  title: string;

  /**
   * Mô tả khóa luận (không rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Ngày bắt đầu (không rỗng)
   */
  @Column({ nullable: false })
  startDate: Date;

  /**
   * Ngày kết thúc (không rỗng)
   */
  @Column({ nullable: false })
  endDate: Date;

  /**
   * ID người hướng dẫn (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  supervisor: User;

  /**
   * ID khoa (tham chiếu đến thực thể Faculty, không rỗng)
   */
  @ManyToOne(() => Faculty, faculty => faculty.id, { nullable: false })
  faculty: Faculty;

  /**
   * Trạng thái (tham chiếu đến thực thể Status, không rỗng)
   */
  @ManyToOne(() => Status, status => status.id, { nullable: false })
  status: Status;

  /**
   * ID người tạo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, user => user.id, { nullable: false })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, user => user.id, { nullable: false })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}
