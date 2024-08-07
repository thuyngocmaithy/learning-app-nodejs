import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, UpdateDateColumn, JoinColumn, CreateDateColumn } from 'typeorm';
import { StudyFrame } from './StudyFrame';
import { Semester } from './Semester';
import { User } from './User';

/**
 * Thực thể Môn học
 */
@Entity()
export class Subject {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
     * Mã môn học (duy nhất, không rỗng)
     */
  @Column({ unique: true, nullable: false })
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
  @ManyToOne(() => Subject, data => data.id, { nullable: true })
  subjectBeforeId: Subject;

  /**
    * Môn học tương đương (có thể rỗng)
    */
  @ManyToOne(() => Subject, data => data.id, { nullable: true })
  subjectEqualId: string | null;

  /**
    * Có bắt buộc không (không rỗng)
    */
  @Column({ type: 'boolean', nullable: false })
  isCompulsory: boolean;

  /**
    * Chuyên ngành (có thể rỗng)
    */
  @Column({ nullable: true })
  specialization: string | null;

  /**
    * ID khung học tập (tham chiếu đến thực thể StudyFrame, không rỗng)
    */
  @ManyToOne(() => StudyFrame, data => data.id, { nullable: false })
  frame: StudyFrame;

  /**
   * ID người tạo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}
