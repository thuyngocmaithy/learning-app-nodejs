import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Faculty } from './Faculty';
import { Major } from './Major';
import { Account } from './Account';

/**
 * Thực thể Người dùng
 */
@Entity()
export class User {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã người dùng (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  userId: string;

  /**
   * Họ và tên (không rỗng)
   */
  @Column({ nullable: false })
  fullname: string;

  /**
   * Ngày sinh (không rỗng)
   */
  @Column({ nullable: false })
  dateOfBirth: Date;

  /**
   * Nơi sinh (không rỗng)
   */
  @Column({ nullable: false })
  placeOfBirth: string;

  /**
   * Số điện thoại (không rỗng)
   */
  @Column({ nullable: false })
  phone: string;

  /**
   * Email (không rỗng)
   */
  @Column({ nullable: false })
  email: string;

  /**
   * Có phải sinh viên hay không (mặc định là true, không rỗng)
   */
  @Column({ default: true, nullable: false })
  isStudent: boolean;

  /**
   * Lớp học (có thể rỗng)
   */
  @Column({ nullable: true })
  class: string;

  /**
   * ID khoa (tham chiếu đến thực thể Faculty, không rỗng)
   */
  @ManyToOne(() => Faculty, { nullable: false })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  /**
   * ID chuyên ngành (tham chiếu đến thực thể Major, không rỗng)
   */
  @ManyToOne(() => Major, { nullable: false })
  @JoinColumn({ name: 'majorId' })
  major: Major;

  /**
   * Vẫn còn học hay không (có thể rỗng)
   */
  @Column({ nullable: true })
  stillStudy: boolean;

  /**
   * Năm học đầu tiên (có thể rỗng)
   */
  @Column({ nullable: true })
  firstAcademicYear: number;

  /**
   * Năm học cuối cùng (có thể rỗng)
   */
  @Column({ nullable: true })
  lastAcademicYear: number;

  /**
   * Đang hoạt động hay không (mặc định là false, không rỗng)
   */
  @Column({ default: false, nullable: false })
  isActive: boolean;

  /**
   * ID tài khoản (tham chiếu đến thực thể Account, không rỗng)
   */
  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  /**
   * ID người tạo (tham chiếu đến thực thể User, có thể rỗng)
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createUserId' })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, có thể rỗng)
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lastModifyUserId' })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}
