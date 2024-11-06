import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn, OneToMany } from 'typeorm';
import { Major } from './Major';
import { Subject_StudyFrameComp } from './Subject_StudyFrameComp';

/**
 * Thực thể Khung đào tạo
 */
@Entity()
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
}

/**
 * Thực thể thành phần khung đào tạo
 */
@Entity("studyFrame_component")
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
}