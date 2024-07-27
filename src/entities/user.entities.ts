import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany, OneToOne } from 'typeorm';
import { Subject } from './subject.entities';
import { Project } from './project.entities';
import { Student_Subject } from './student_subject.entities';
import { Score } from './score.entities';
import { Follower } from './follower.entities';
import { Thesis } from './thesis.entities';
import { Account } from './account.entities';
import { Attachment } from './attach.entities';
import { Internship } from './intern.entities';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

// Người dùng: sinh viên, giảng viên
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: true })
  ma_sv!: string;

  @Column({ unique: true, nullable: true })
  ma_gv!: string;

  @Column()
  fullname!: string;

  @Column({
    type: 'enum',
    enum: Sex,
  })
  sex!: Sex;

  @Column()
  date_of_birth!: Date;

  @Column()
  place_of_birth!: string;

  @Column()
  phone!: string;

  @Column()
  email!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole = UserRole.STUDENT;

  @Column({ default: false })
  isStudent!: Boolean;

  @Column({ nullable: true })
  class!: string;

  @Column({ nullable: true })
  major!: string;

  @Column({ nullable: true })
  specialization!: string;

  @Column({ nullable: true })
  specializationID!: string;

  @Column({ nullable: true, default: false })
  stillStudy!: Boolean;

  @Column({ nullable: true })
  first_academic_year!: number;

  @Column({ nullable: true })
  last_academic_year!: number;

  @Column({ nullable: true })
  faculty!: string;

  @Column({ nullable: true })
  hire_date!: Date;

  @Column({ nullable: true, default: false })
  isActive!: Boolean;

  @OneToOne(() => Account)
  account!: Account;

  @OneToMany(() => Attachment, attachment => attachment.createdBy)
  attachments!: Attachment[];

  @OneToMany(() => Internship, internship => internship.creater)
  createdInternships!: Internship[];

  @OneToMany(() => Internship, internship => internship.updater)
  updatedInternships!: Internship[];

  @OneToMany(() => Project, project => project.create_user)
  createdProjects!: Project[];

  @OneToMany(() => Project, project => project.update_user)
  updatedProjects!: Project[];

  @OneToMany(() => Student_Subject, enrollment => enrollment.user)
  enrollments!: Student_Subject[];

  @OneToMany(() => Score, score => score.student)
  score!: Score[];

  @ManyToMany(() => Subject, subject => subject.students_completed)
  @JoinTable({ name: 'student_subjects_completed' })
  subjects_completed!: Subject[];

  @ManyToMany(() => Subject, subject => subject.teachers_taught)
  @JoinTable({ name: 'teacher_subjects_taught' })
  subjects_taught!: Subject[];

  @OneToMany(() => Follower, follower => follower.follower)
  following!: Follower[];

  @OneToMany(() => Follower, follower => follower.following)
  followers!: Follower[];


  @OneToMany(() => Thesis, thesis => thesis.supervisor)
  supervisedTheses!: Thesis[];

  @ManyToMany(() => Thesis, thesis => thesis.authors)
  authoredTheses!: Thesis[];



}