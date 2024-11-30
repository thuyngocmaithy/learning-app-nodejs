import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Subject } from './Subject';
import { User } from './User';
import { Semester } from './Semester';
/**
 * Thực thể Điểm
 */
@Entity()
export class Score {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID môn học (tham chiếu đến thực thể Subject, không rỗng)
   */
  @ManyToOne(() => Subject, data => data.subjectId, { nullable: false })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  /**
   * ID sinh viên (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  /**
  * Học kỳ (tham chiếu đến thực thể Semester, không rỗng)
  */
  @ManyToOne(() => Semester, data => data.semesterId, { nullable: true })
  @JoinColumn({ name: 'semesterId' })  // Add this relation
  semester: Semester;

  /**
   * Điểm thi (rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  examScore: number;

  /**
   * Điểm kiểm tra (rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  testScore: number;

  /**
   * Điểm cuối kỳ hệ 10 (không rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: false })
  finalScore10: number;

  /**
   * Điểm cuối kỳ hệ 4 (không rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: false })
  finalScore4: number;

  /**
   * Điểm chữ cuối kỳ (không rỗng)
   */
  @Column({ nullable: false })
  finalScoreLetter: string;

  /**
   * Kết quả (mặc định: false, không rỗng)
   */
  @Column({ default: true, nullable: false })
  result: boolean;
}

/**
 * Thực thể Điểm thành phần
 */
@Entity()
export class ComponentScore {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID điểm (tham chiếu đến thực thể Score, không rỗng)
   */
  @ManyToOne(() => Score, data => data.id, { nullable: false })
  score: Score;

  /**
   * Tên thành phần (không rỗng)
   */
  @Column({ nullable: false })
  componentName: string;

  /**
   * Trọng số (không rỗng)
   */
  @Column('int', { nullable: false })
  weight: number;

  /**
   * Điểm trọng số (không rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: false })
  weightScore: number;
}
