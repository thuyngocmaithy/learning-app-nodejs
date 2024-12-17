import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn, OneToMany, Index } from 'typeorm';
import { Major } from './Major';
import { Subject_StudyFrameComp } from './Subject_StudyFrameComp';
import { Faculty } from './Faculty';
import { Cycle } from './Cycle';

/**
 * Thực thể Khung đào tạo
 */
@Entity()
@Index("idx_studyFrame_faculty", ["faculty"]) // Chỉ mục cho trường facultyId
@Index("idx_studyFrame_cycle", ["cycle"]) // Chỉ mục cho trường cycleId
export class StudyFrame {
  /**
   * Mã khung (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  frameId: string;

  /**
   * Tên khung
   */
  @Column({ nullable: false })
  frameName: string;

  /**
   * Mã ngành: Áp dụng cho ngành nào
   * Nhớ đổi lại nullable false
   */
  @ManyToOne(() => Faculty, faculty => faculty.facultyId, { nullable: true })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  /**
   * Chu kỳ: Áp dụng cho chu kỳ nào
   * Nhớ đổi lại nullable false
   */
  @ManyToOne(() => Cycle, cycle => cycle.cycleId, { nullable: true })
  @JoinColumn({ name: 'cycleId' })
  cycle: Cycle;
}

/**
 * Thực thể thành phần khung đào tạo
 */
@Entity("studyFrame_component")
@Index("idx_studyFrameComponent_major", ["major"]) // Chỉ mục cho trường majorId
@Index("idx_studyFrameComponent_frameId", ["frameComponentId"]) // Chỉ mục cho trường frameComponentId
export class StudyFrame_Component {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã thành phần khung (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  frameComponentId: string;

  /**
   * Tên thành phần khung (không rỗng)
   */
  @Column({ nullable: false })
  frameComponentName: string;


  /**
   * Mô tả (có thể rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Số tín chỉ yêu cầu, có thể rỗng
   */
  @Column({ nullable: true })
  creditHour: string;

  /**
    * Mã chuyên ngành
    */
  @ManyToOne(() => Major, major => major.majorId, { nullable: true })
  @JoinColumn({ name: 'majorId' })
  major: Major;

  // Thêm cascade: true để xóa liên quan đến Subject_StudyFrameComp khi xóa StudyFrameComp
  @OneToMany(() => Subject_StudyFrameComp, ssm => ssm.studyFrameComponent, { cascade: ['insert', 'update', 'remove'] })
  ssm: Subject_StudyFrameComp[];

  /**
    * Có bắt buộc không (không rỗng)
    */
  @Column({ type: 'boolean', default: false, nullable: false })
  isCompulsory: boolean;
}