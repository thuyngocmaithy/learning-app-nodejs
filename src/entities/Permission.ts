import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Thực thể Quyền
 */
@Entity()
export class Permission {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã quyền (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  permissionId: string;

  /**
   * Tên quyền (không rỗng)
   */
  @Column({ nullable: false })
  permissionName: string;
}
