import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';


/**
 * Thực thể Thông báo
 */
@Entity()
export class Notification {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Loại thông báo (không rỗng)
   */
  @Column({ nullable: false })
  type: string;

  /**
   * Nội dung thông báo (không rỗng)
   */
  @Column({ nullable: false })
  content: string;

  /**
   * URL liên kết (không rỗng)
   */
  @Column({ nullable: false })
  url: string;

  /**
   * ID người nhận thông báo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  toUser: User;

  /**
   * Trạng thái đã đọc (mặc định: false, không rỗng)
   */
  @Column({ default: false, nullable: false })
  isRead: boolean;

  /**
   * ID người tạo thông báo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;
}