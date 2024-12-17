import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index } from 'typeorm';
import { StudyFrame_Component } from './StudyFrame';
import { Subject } from './Subject';

/**
 * Thực thể môn học thuộc: thành phần khung đào tạo, chuyên ngành
 */
@Entity('subject_studyFrameComp')
@Index("IDX_SUBJECT_STUDYFRAMECOMP_SUBJECTID", ["subject"])  // Chỉ mục cho cột subjectId
@Index("IDX_SUBJECT_STUDYFRAMECOMP_STUDYFRAMECOMPONENTID", ["studyFrameComponent"])  // Chỉ mục cho cột studyFrameComponentId
export class Subject_StudyFrameComp {
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
  @ManyToOne(() => StudyFrame_Component, studyFrame_Component => studyFrame_Component.frameComponentId, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studyFrameComponentId', referencedColumnName: 'frameComponentId' })
  studyFrameComponent: StudyFrame_Component;
}
