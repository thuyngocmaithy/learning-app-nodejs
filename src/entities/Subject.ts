import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { User } from './User';
import { Score } from './Score';
import { Student_Subject } from './Student_Subject';
import { StudyFrame } from './StudyFrame';

// Học phần
@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ unique: true })
  idMonhoc!: string;

  @Column()
  tenMonHoc!: string;

  @Column()
  tinchi!: number;

  @Column()
  divide!: Boolean;

  @Column()
  haveMonhoctruoc!: Boolean;

  @Column({ nullable: true })
  idMonhoc_truoc!: string;

  @Column()
  haveMonhoctuongduong!: Boolean;

  @Column({ nullable: true })
  idMonhoctuongduong!: string;

  @Column()
  specialization!: string;  // New column to store the major

  @Column({ type: 'boolean' })
  isCompulsory!: boolean;  // New column to store whether the subject is compulsory

  @OneToMany(() => Score, score => score.subject)
  score!: Score[];

  @OneToMany(() => Student_Subject, enrollment => enrollment.subject)
  enrollments!: Student_Subject[];

  @ManyToMany(() => User, user => user.subjects_completed)
  students_completed!: User[];

  @ManyToMany(() => User, user => user.subjects_taught)
  teachers_taught!: User[];

  @ManyToMany(() => StudyFrame, studyFrame => studyFrame.subjects)
  studyFrames!: StudyFrame[];
}
