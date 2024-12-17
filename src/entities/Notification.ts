import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

/**
 * Thực thể Thông báo
 */
@Entity()
@Index('IDX_NOTIFICATION_TYPE', ['type']) // Index cho cột type
@Index('IDX_NOTIFICATION_ISREAD', ['isRead']) // Index cho trạng thái đã đọc
export class Notification {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Loại thông báo
   */
  @Column({
    type: 'enum',
    enum: ['success', 'error', 'warning', 'info'],
  })
  type: 'success' | 'error' | 'warning' | 'info' = 'info';

  /**
   * Nội dung thông báo
   */
  @Column({ nullable: true })
  content: string;

  /**
   * Tiêu đề
   */
  @Column({ nullable: true })
  title: string;

  /**
   * URL liên kết
   */
  @Column({ nullable: true })
  url: string;

  /**
   * Người nhận thông báo (ManyToMany)
   */
  @ManyToMany(() => User, (user) => user.receivedNotifications, { cascade: true })
  @JoinTable({
    name: 'notification_users', // Bảng trung gian
    joinColumn: { name: 'notificationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'userId' },
  })
  toUsers: User[];

  /**
   * Người tạo thông báo
   */
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  @JoinColumn({ name: 'createUserId' })
  createUser: User;

  /**
   * Ngày tạo
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * Đánh dấu thông báo hệ thống
   */
  @Column({ default: false, nullable: false })
  isSystem: boolean;


  /**
  * Trạng thái ẩn (mặc định: false, không rỗng)
  */
  @Column({ default: false, nullable: false })
  disabled: boolean;

  /**
   * Trạng thái đã đọc (mặc định: false, không rỗng)
   */
  @Column({ default: false, nullable: false })
  isRead: boolean;


}
