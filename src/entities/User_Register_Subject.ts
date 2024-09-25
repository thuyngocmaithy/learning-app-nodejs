import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';
import { User } from './User';
import { Subject } from './Subject';
import { Semester } from './Semester';

/**
 * Thực thể đăng ký môn học của sinh viên
 */
@Entity()
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
