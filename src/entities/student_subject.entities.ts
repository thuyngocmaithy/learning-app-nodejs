import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user.entities';
import { Subject } from './subject.entities';
import { Score } from './score.entities';

// Sinh viên đăng ký môn nào
@Entity()
export class Student_Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.enrollments)
  user!: User;

  @ManyToOne(() => Subject, subject => subject.enrollments)
  subject!: Subject;

  @Column({ type: 'datetime' })
  enrollmentDate!: Date;

  @OneToOne(() => Score, score => score.enrollment)
  score!: Score;
}