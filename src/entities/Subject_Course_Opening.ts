import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { StudyFrame } from './StudyFrame';
import { Subject } from './Subject';
import { Semester } from './Semester';
import { Cycle } from './Cycle';

/**
 * Mở học phần: 1 môn có thể được mở nhiều năm, nhiều khung
 */
@Entity('subject_course_opening')
@Index("IDX_SUBJECT_SEMESTER", ["subject", "semester"])  // Chỉ mục composite cho subjectId và semesterId
@Index("IDX_STUDYFRAME_SEMESTER", ["studyFrame", "semester"])  // Chỉ mục composite cho studyFrameId và semesterId
@Index("IDX_SUBJECT_STUDYFRAME", ["subject", "studyFrame"])  // Chỉ mục composite cho subjectId và studyFrameId
export class Subject_Course_Opening {
  /**
   * Khóa chính tự động tạo
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã môn học
   */
  @ManyToOne(() => Subject, subject => subject.subjectId, { nullable: false })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  /**
   * Học kỳ mở
   */
  @ManyToOne(() => Semester, semester => semester.semesterId, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'semesterId', referencedColumnName: 'semesterId' })
  semester: Semester;

  /**
   * Giảng viên dạy
   */
  @Column({ nullable: true })
  instructor: string;

  /**
   * Trạng thái ẩn giảng viên dạy
   */
  @Column({ default: false, nullable: false })
  disabled: boolean;

  /**
   * Mã Khung ctr đào tạo 
   */
  @ManyToOne(() => StudyFrame, studyFrame => studyFrame.frameId, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studyFrameId', referencedColumnName: 'frameId' })
  studyFrame: StudyFrame;
}
