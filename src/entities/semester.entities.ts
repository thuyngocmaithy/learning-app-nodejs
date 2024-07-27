import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Subject } from './subject.entities';
import { AcademicYear } from './academicYear.entities';

// Học kỳ
@Entity()
export class Semester {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  semesterNumber!: number;

  @ManyToOne(() => AcademicYear, academicYear => academicYear.semesters)
  academicYear: AcademicYear = new AcademicYear;

  @ManyToMany(() => Subject)
  @JoinTable({ name: 'semester_subjects' })
  subjects!: Subject[];
}