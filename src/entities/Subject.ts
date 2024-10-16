import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, UpdateDateColumn, JoinColumn, CreateDateColumn, PrimaryColumn, JoinTable } from 'typeorm';
import { StudyFrame } from './StudyFrame';
import { User } from './User';
import { Major } from './Major';

/**
 * Thực thể Môn học
 * Một môn học có thể có một môn học trước
 * Một môn học có thể liên kết với một chuyên ngành 
 * Một môn học có thể thuộc một khung đào tạo
 */
@Entity()
export class Subject {
  /**
   * Mã môn học (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  subjectId: string;

  /**
    * Tên môn học (không rỗng)
    */
  @Column({ nullable: false })
  subjectName: string;

  /**
    * Số tín chỉ (không rỗng)
    */
  @Column('int', { nullable: false })
  creditHour: number;

  /**
    * Môn học trước (có thể rỗng)
    */
  @ManyToOne(() => Subject, data => data.subjectId, { nullable: true })
  @JoinColumn({ name: 'subjectBefore' })
  subjectBefore: Subject;

  /**
    * Môn học tương đương (có thể rỗng)
    */
  @ManyToOne(() => Subject, data => data.subjectId, { nullable: true })
  @JoinColumn({ name: 'subjectEqualId' })
  subjectEqual: string | null;

  /**
    * Có bắt buộc không (không rỗng)
    */
  @Column({ type: 'boolean', nullable: false })
  isCompulsory: boolean;

  /**
   * ID chuyên ngành (tham chiếu đến thực thể Major, có thể rỗng)
   */
  @ManyToOne(() => Major, data => data.majorId, { nullable: true })
  @JoinColumn({ name: 'majorId' })
  major: Major;

  /**
    * ID khung học tập (tham chiếu đến thực thể StudyFrame)
    */
  @ManyToMany(() => StudyFrame)
  @JoinTable({
    name: 'subject_studyFrame',
    joinColumn: { name: 'subjectId', referencedColumnName: 'subjectId' },
    inverseJoinColumn: { name: 'frameId', referencedColumnName: 'frameId' },
  })
  frames: StudyFrame[];

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
}
