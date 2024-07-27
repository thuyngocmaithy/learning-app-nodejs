import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Semester } from './semester.entities';

// Năm học
@Entity()
export class AcademicYear {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  year!: string;

  @OneToMany(() => Semester, semester => semester.academicYear)
  semesters!: Semester[];
}