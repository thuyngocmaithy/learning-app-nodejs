import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Index } from 'typeorm';
import { User } from './User';
import { Subject } from './Subject';
import { Semester } from './Semester';

/**
 * Thực thể đăng ký môn học của sinh viên
 */
@Entity()
@Index("IDX_USER_ID", ["user"])  // Chỉ mục cho userId
@Index("IDX_SUBJECT_ID", ["subject"])  // Chỉ mục cho subjectId
@Index("IDX_SEMESTER_ID", ["semester"])  // Chỉ mục cho semesterId
export class UserRegisterSubject {
  /**
   * Khóa chính tự động tạo
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã người dùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, user => user.userId, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Mã môn học (tham chiếu đến thực thể Subject, không rỗng)
   */
  @ManyToOne(() => Subject, subject => subject.subjectId, { nullable: false })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  /**
   * Học kỳ (tham chiếu đến thực thể Semester, không rỗng)
   */
  @ManyToOne(() => Semester, semester => semester.semesterId, { nullable: false })
  @JoinColumn({ name: 'semesterId' })
  semester: Semester;


  /**
   * Ngày tạo (tự động)
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registerDate: Date;

  /**
   * Ngày chỉnh sửa cuối cùng (tự động)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}
