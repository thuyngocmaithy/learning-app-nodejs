import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Cycle } from './Cycle';

/**
 * Thực thể Học kỳ
 * Một học kỳ thuộc về một chu kỳ
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
  @Column({ type: 'int', width: 4, nullable: false })
  academicYear: number;

  /**
   * Chu kỳ học tập (mỗi học kỳ thuộc một chu kỳ)
   * Nhớ đổi lại nullable true
   */
  @ManyToOne(() => Cycle, cycle => cycle.semesters, { nullable: true })
  @JoinColumn({ name: 'cycleId' })
  cycle: Cycle;
}