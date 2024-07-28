import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Follower } from './Follower';
import { User } from './User';
import { Status } from './Status';

/**
 * Thực thể Dự án
 */
@Entity()
export class Project {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã dự án (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  projectId: string;

  /**
   * Tên dự án (không rỗng)
   */
  @Column({ nullable: false })
  projectName: string;

  /**
   * Mô tả (không rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Số lượng thành viên (không rỗng)
   */
  @Column('int', { nullable: false })
  numberOfMember: number;

  /**
   * Số lượng đã đăng ký (không rỗng)
   */
  @Column('int', { nullable: false })
  numberOfRegister: number;

  /**
   * Trạng thái (tham chiếu đến thực thể Status, không rỗng)
   */
  @ManyToOne(() => Status, data => data.id, { nullable: false })
  status: Status;

  /**
   * Ngày bắt đầu (không rỗng)
   */
  @Column({ nullable: false })
  startDate: Date;

  /**
   * Ngày kết thúc (không rỗng)
   */
  @Column({ nullable: false })
  finishDate: Date;

  /**
   * Thời gian hoàn thành (không rỗng)
   */
  @Column({ nullable: false })
  completionTime: Date;

  /**
   * Người hướng dẫn (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  instructor: User;

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
  @ManyToOne(() => User, data => data.id, { nullable: false })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}
