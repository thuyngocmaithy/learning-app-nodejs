import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { AcademicYear } from './AcademicYear'

/**
 * Thực thể Học kỳ
 */
@Entity()
export class Semester {
  /**
   * Khóa chính
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  semesterId: string;

  /**
   * Tên học kỳ
   */
  @Column('int')
  semesterName: number;

  /**
   * Năm học (tham chiếu đến thực thể AcademicYear, không rỗng)
   */
  @ManyToOne(() => AcademicYear, data => data.yearId, { nullable: false })
  academicYear: AcademicYear;



}