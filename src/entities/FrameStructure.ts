import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { StudyFrame, StudyFrame_Component } from './StudyFrame';

/**
 * Thực thể cấu trúc khung: Liên kết khung với thành phần khung
 */
@Entity('frameStructure')
@Index('idx_frameStructure_studyFrame', ['studyFrame']) // Chỉ mục trên studyFrameId
@Index('idx_frameStructure_studyFrameComponent', ['studyFrameComponent']) // Chỉ mục trên studyFrameComponentId
@Index('idx_frameStructure_studyFrameComponentParent', ['studyFrameComponentParent']) // Chỉ mục trên studyFrameComponentParentId
export class FrameStructure {
  /**
   * Khóa chính tự động tạo
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã khung
   */
  @ManyToOne(() => StudyFrame, studyFrame => studyFrame.frameId, { nullable: false })
  @JoinColumn({ name: 'studyFrameId' })
  studyFrame: StudyFrame;


  /**
   * Mã thành phần Khung ctr đào tạo 
   */
  @ManyToOne(() => StudyFrame_Component, studyFrame_Component => studyFrame_Component.frameComponentId, { nullable: false })
  @JoinColumn({ name: 'studyFrameComponentId', referencedColumnName: 'frameComponentId' })
  studyFrameComponent: StudyFrame_Component;


  /**
   * Mã thành phần Khung ctr đào tạo cha => Tạo cấu trúc thành phần khung
   */
  @ManyToOne(() => StudyFrame_Component, studyFrame_Component => studyFrame_Component.frameComponentId, { nullable: true })
  @JoinColumn({ name: 'studyFrameComponentParentId', referencedColumnName: 'frameComponentId' })
  studyFrameComponentParent: StudyFrame_Component;

  /**
   * Thứ tự, có thể rỗng
   */
  @Column({ nullable: true })
  orderNo: number;

}
