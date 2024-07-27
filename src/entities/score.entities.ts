import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Subject } from './subject.entities'; // Adjust the import path as needed
import { User } from './user.entities';
import { Student_Subject } from './student_subject.entities';

// Điểm
@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Subject, subject => subject.score)
  subject!: Subject;

  @ManyToOne(() => User, user => user.score)
  student!: User;

  @Column()
  score_thi!: string;

  @Column()
  score_giua_ky!: string;

  @Column()
  score_tk!: string;

  @Column()
  score_tk_so!: string;

  @Column()
  score_tk_chu!: string;

  @Column()
  ket_qua!: number;

  @OneToMany(() => ScoreThanhPhan, scoreThanhPhan => scoreThanhPhan.score)
  ds_component_point!: ScoreThanhPhan[];

  @OneToOne(() => Student_Subject, enrollment => enrollment.score)
  @JoinColumn()
  enrollment: Student_Subject = new Student_Subject;
}

@Entity()
export class ScoreThanhPhan {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Score, score => score.ds_component_point)
  score!: Score;

  @Column()
  component_name!: string;

  @Column()
  trong_so!: string;

  @Column()
  component_point!: string;
}


