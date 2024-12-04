import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Status } from './Status';
import { Faculty } from './Faculty';
import { Follower } from './Follower';
import { ScientificResearchGroup } from './ScientificResearchGroup';
import { ScientificResearch_User } from './ScientificResearch_User';

/**
 * Thực thể Dự án
 */
@Entity()
export class ScientificResearch {
  /**
   * Mã dự án (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  scientificResearchId: string;

  /**
   * Tên dự án (không rỗng)
   */
  @Column({ nullable: false })
  scientificResearchName: string;

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

  // Thêm cascade: true để xóa liên quan đến Follower khi xóa ScientificResearch
  @OneToMany(() => Follower, follower => follower.scientificResearch, { cascade: ['insert', 'update', 'remove'] })
  follower: Follower[];

  // Thêm cascade: true để xóa liên quan đến scientificResearch_user khi xóa ScientificResearch
  @OneToMany(() => ScientificResearch_User, object => object.scientificResearch, { cascade: ['insert', 'update', 'remove'] })
  scientificResearch_user: ScientificResearch_User[];

  /**
   * Nhóm đề tài NCKH
   */
  @ManyToOne(() => ScientificResearchGroup, data => data.scientificResearchGroupId, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scientificResearchGroupId' })
  scientificResearchGroup: ScientificResearchGroup;

  /**
   * Hiển thị
   */
  @Column({ nullable: false, default: false })
  isDisable: boolean;
  existingResearch: ScientificResearch;
}
