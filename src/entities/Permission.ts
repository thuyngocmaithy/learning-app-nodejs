import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { Account } from './Account';
import { User } from './User';

/**
 * Thực thể Quyền
 */
@Entity()
export class Permission {
  /**
   * Mã quyền (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  permissionId: string;

  /**
   * Tên quyền (không rỗng)
   */
  @Column({ nullable: false })
  permissionName: string;

  /**
   * ID người tạo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: true })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}