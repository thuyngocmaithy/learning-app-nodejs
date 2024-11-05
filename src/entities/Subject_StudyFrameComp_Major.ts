import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { StudyFrame_Component } from './StudyFrame';
import { Subject } from './Subject';
import { Major } from './Major';

/**
 * Thực thể môn học thuộc: thành phần khung đào tạo, chuyên ngành
 */
@Entity('subject_studyFrameComp_major')
export class Subject_StudyFrameComp_Major {
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
   * Mã thành phần Khung ctr đào tạo 
   */
  @ManyToOne(() => StudyFrame_Component, studyFrame_Component => studyFrame_Component.frameComponentId, { nullable: false })
  @JoinColumn({ name: 'studyFrameComponentId', referencedColumnName: 'frameComponentId' })
  studyFrameComponent: StudyFrame_Component;


  /**
   * Mã chuyên ngành
   */
  @ManyToOne(() => Major, major => major.majorId, { nullable: true })
  @JoinColumn({ name: 'majorId' })
  major: Major;
}
