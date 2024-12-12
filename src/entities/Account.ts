import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Permission } from './Permission';

/**
 * Thực thể Tài khoản
 */
@Entity()
export class Account {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tên đăng nhập (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  username: string;

  /**
   * Mật khẩu (không rỗng)
   */
  @Column({ nullable: false })
  password: string;

  /**
   * Token làm mới (có thể rỗng)
   */
  @Column({ nullable: true, type: 'text' })
  refreshToken: string;


  /**
   * access_token (có thể rỗng)
   */
  @Column({ nullable: true, length: 2048 })
  access_token: string;

  /**
   * Quyền (tham chiếu đến thực thể Permission)
   */
  @ManyToOne(() => Permission, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'permissionId', })
  permission: Permission;

  /**
   * Tài khoản hệ thống
   */
  @Column({ default: false, nullable: false })
  isSystem: boolean;

  /**
 * Ngày tạo (không rỗng)
 */
  @CreateDateColumn()
  createDate: Date;


  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}


