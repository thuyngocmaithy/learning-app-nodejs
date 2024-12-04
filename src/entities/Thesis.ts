import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Status } from './Status';
import { Follower } from './Follower';
import { ThesisGroup } from './ThesisGroup';
import { Thesis_User } from './Thesis_User';

/**
 * Thực thể khóa luận
 */
@Entity()
export class Thesis {
  /**
   * Mã khóa luận (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  thesisId: string;

  /**
   * Tên khóa luận (không rỗng)
   */
  @Column({ nullable: false })
  thesisName: string;

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
  @JoinColumn({ name: 'statusId' })
  status: Status;

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
  @JoinColumn({ name: 'instructorId' })
  instructor: User;


  /**
   * Số lượng đã đăng ký (có thể rỗng)
   */
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budget: number;

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
  @ManyToOne(() => User, data => data.userId, { nullable: true })
  @JoinColumn({ name: 'lastModifyUserId' })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;

  // Thêm cascade: true để xóa liên quan đến Follower khi xóa Thesis
  @OneToMany(() => Follower, follower => follower.thesis, { cascade: ['insert', 'update', 'remove'] })
  follower: Follower[];

  // Thêm cascade: true để xóa liên quan đến thesis_user khi xóa Thesis
  @OneToMany(() => Thesis_User, object => object.thesis, { cascade: ['insert', 'update', 'remove'] })
  thesis_user: Thesis_User[];

  /**
   * Nhóm đề tài Khóa luận
   */
  @ManyToOne(() => ThesisGroup, data => data.thesisGroupId, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesisGroupId' })
  thesisGroup: ThesisGroup;

  /**
   * Hiển thị
   */
  @Column({ nullable: false, default: false })
  isDisable: boolean;
}
