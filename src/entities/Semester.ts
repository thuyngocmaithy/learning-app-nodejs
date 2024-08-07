import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Subject } from './Subject';
import { AcademicYear } from './AcademicYear'

/**
 * Thực thể Học kỳ
 */
@Entity()
export class Semester {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tên học kỳ
   */
  @Column('int')
  semesterName: number;

  /**
   * Năm học (tham chiếu đến thực thể AcademicYear, không rỗng)
   */
  @ManyToOne(() => AcademicYear, data => data.id, { nullable: false })
  academicYear: AcademicYear;


  
}