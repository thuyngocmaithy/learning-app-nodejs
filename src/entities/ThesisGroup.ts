import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { User } from './User';
import { Status } from './Status';
import { Faculty } from './Faculty';

/**
 * Thực thể Nhóm đề tài khóa luận
 */
@Entity()
export class ThesisGroup {
  /**
   * Mã nhóm đề tài khóa luận
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  thesisGroupId: string;

  /**
   * Tên nhóm đề tài khóa luận
   */
  @Column({ nullable: false })
  thesisGroupName: string;


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
   * Tạo đề tài từ ngày
   * Nhớ sửa lại nullable: false
   */
  @Column({ nullable: true })
  startCreateThesisDate: Date;

  /**
   * Tạo đề tài đến ngày
   * Nhớ sửa lại nullable: false
   */
  @Column({ nullable: true })
  endCreateThesisDate: Date;


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

  /**
   * Hiển thị
   */
  @Column({ nullable: false, default: false })
  isDisable: boolean;
}