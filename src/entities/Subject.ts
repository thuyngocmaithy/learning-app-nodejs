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
   * ID khung học tập (tham chiếu đến thực thể Frame, không rỗng)
   */
  @ManyToOne(() => StudyFrame, data => data.id, { nullable: false })
  frame: StudyFrame;

  /**
   * ID học kỳ (tham chiếu đến thực thể Semester, không rỗng)
   */
  @ManyToOne(() => Semester, data => data.id, { nullable: false })
  semester: Semester;

  /**
   * Số tín chỉ (không rỗng)
   */
  @Column('int', { nullable: false })
  numberOfCredit: number;

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
