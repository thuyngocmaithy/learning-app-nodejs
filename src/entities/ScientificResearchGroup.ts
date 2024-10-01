import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Status } from './Status';
import { Faculty } from './Faculty';

/**
 * Thực thể Nhóm đề tài NCKH
 */
@Entity()
export class ScientificResearchGroup {
  /**
   * Mã nhóm đề tài NCKH
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  scientificResearchGroupId: string;

  /**
   * Tên nhóm đề tài NCKH
   */
  @Column({ nullable: false })
  scientificResearchGroupName: string;


  /**
   * Trạng thái (tham chiếu đến thực thể Status, không rỗng)
   */
  @ManyToOne(() => Status, data => data.statusId, { nullable: false })
  @JoinColumn({ name: 'statusId' })
  status: Status;

  /**
   * Năm thực hiện (không rỗng)
   */
  @Column('int', { nullable: true })
  startYear: number;

  /**
   * Năm kết thúc (có thể rỗng)
   */
  @Column('int', { nullable: true })
  finishYear: number;

  /**
   * ID khoa (tham chiếu đến thực thể Faculty, không rỗng)
   */
  @ManyToOne(() => Faculty, data => data.facultyId, { nullable: false })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;


  /**
   * ID người tạo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  @JoinColumn({ name: 'createUserId' })
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
  @JoinColumn({ name: 'lastModifyUserId' })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}