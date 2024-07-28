import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Subject } from './Subject';
import { User } from './User';

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
  @ManyToOne(() => Subject, data => data.id, { nullable: false })
  subject: Subject;

  /**
   * ID sinh viên (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.id, { nullable: false })
  student: User;

  /**
   * Điểm thi (không rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: false })
  examScore: number;

  /**
   * Điểm kiểm tra (không rỗng)
   */
  @Column('decimal', { precision: 5, scale: 2, nullable: false })
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
  @Column({ default: false, nullable: false })
  result: boolean;

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
