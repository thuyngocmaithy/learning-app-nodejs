import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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
   * Email (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  email: string;

  /**
   * Token làm mới (có thể rỗng)
   */
  @Column({ nullable: true })
  refreshToken: string;


    /**
   * access_token (có thể rỗng)
   */
    @Column({ nullable: true, length: 2048 })  
    access_token: string;

  /**
   * Quyền (tham chiếu đến thực thể Permission)
   */
  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}


