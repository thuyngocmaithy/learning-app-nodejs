import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Thực thể Năm học
 */
@Entity()
export class AcademicYear {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Năm học (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  year: string;
}