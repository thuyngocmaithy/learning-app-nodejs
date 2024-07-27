import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { Subject } from './subject.entities';


// Khung đào tạo
@Entity()
export class StudyFrame {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  divide!: boolean;

  @ManyToMany(() => Subject)
  @JoinTable({
    name: 'study_frame_subjects',
    joinColumn: { name: 'studyFrameId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subjectId', referencedColumnName: 'id' }
  })
  subjects!: Subject[];

  @Column({ type: 'boolean' })
  isCompulsory!: boolean;

  @ManyToOne(() => StudyFrame, studyFrame => studyFrame.subcategories)
  parent!: StudyFrame;

  @OneToMany(() => StudyFrame, studyFrame => studyFrame.parent)
  subcategories!: StudyFrame[];
}