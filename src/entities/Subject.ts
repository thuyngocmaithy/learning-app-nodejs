import { Entity, Column, ManyToOne, UpdateDateColumn, JoinColumn, CreateDateColumn, PrimaryColumn, Index } from 'typeorm';
import { User } from './User';

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
  @Index('IDX_SUBJECT_BEFORE') // Index cho môn học trước
  subjectBefore: Subject | null; // Thêm "| null"

  /**
    * Môn học tương đương (có thể rỗng)
    */
  @ManyToOne(() => Subject, data => data.subjectId, { nullable: true })
  @JoinColumn({ name: 'subjectEqualId' })
  subjectEqual: string | null;


  /**
   * ID người tạo (tham chiếu đến thực thể User, rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: true })
  @JoinColumn({ name: 'createUserId' })
  @Index('IDX_CREATE_USER') // Index cho người chỉnh sửa cuối cùng
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
  @Index('IDX_LAST_MODIFY_USER') // Index cho người chỉnh sửa cuối cùng
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;

  //   /**
  //    * Danh sách học kỳ thuộc chu kỳ này
  //    */
  //   @OneToMany(() => Semester, semester => semester.cycle)
  //   semesters: Semester[];
}
