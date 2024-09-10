import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Status } from './Status';
import { Faculty } from './Faculty';
import { Follower } from './Follower';

/**
 * Thực thể Dự án
 */
@Entity()
export class Project {
  /**
   * Mã dự án (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  projectId: string;

  /**
   * Tên dự án (không rỗng)
   */
  @Column({ nullable: false })
  projectName: string;

  /**
   * Mô tả (không rỗng)
   */
  @Column({ nullable: false, length: 999 })
  description: string;

  /**
   * Số lượng thành viên (không rỗng)
   */
  @Column('int', { nullable: false })
  numberOfMember: number;

  /**
   * Trạng thái (tham chiếu đến thực thể Status, không rỗng)
   */
  @ManyToOne(() => Status, data => data.statusId, { nullable: false })
  status: Status;

  /**
   * Thời gian thực hiện (có thể rỗng)
   */
  @Column({ nullable: true })
  executionTime: String;

  /**
   * Ngày bắt đầu (không rỗng)
   */
  @Column({ nullable: true })
  startDate: Date;

  /**
   * Ngày kết thúc (có thể rỗng)
   */
  @Column({ nullable: true })
  finishDate: Date;

  /**
   * Người hướng dẫn (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: true })
  instructor: User;

  /**
   * ID khoa (tham chiếu đến thực thể Faculty, không rỗng)
   */
  @ManyToOne(() => Faculty, data => data.facultyId, { nullable: false })
  faculty: Faculty;


  /**
   * Cấp dự án (không rỗng)
   */
  @Column({
    type: 'enum',
    enum: ['Cơ sở', 'Thành phố', 'Bộ', 'Quốc gia', 'Quốc tế'],
  })
  level: 'Cơ sở' | 'Thành phố' | 'Bộ' | 'Quốc gia' | 'Quốc tế' = "Cơ sở";


  /**
   * Số lượng đã đăng ký (có thể rỗng)
   */
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budget: number;

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
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;

  // Thêm cascade: true để xóa liên quan đến Follower khi xóa Project
  @OneToMany(() => Follower, follower => follower.project, { cascade: ['insert', 'update', 'remove'] })
  follower: Follower[];

}
