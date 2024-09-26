import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';

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
 * Năm học (duy nhất, không rỗng)
 */
  @Column({ nullable: false })
  academicYear: string;

}