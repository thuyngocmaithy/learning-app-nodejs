import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { Subject } from './Subject';


/**
 * Thực thể Khung đào tạo
 */
@Entity()
export class StudyFrame {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã khung (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  frameId: string;

  /**
   * Tên khung (không rỗng)
   */
  @Column({ nullable: false })
  frameName: string;


  /**
   * Mô tả (có thể rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Thứ tự, có thể rỗng
   */
  @Column({ nullable: true })
  orderNo: number;

  /**
   * ID khung cha (tham chiếu đến thực thể StudyFrame, có thể rỗng)
   */
  @ManyToOne(() => StudyFrame, data => data.id, { nullable: true })
  parentFrame: StudyFrame;

  /**
   * Số tín chỉ yêu cầu, có thể rỗng
   */
  @Column({ nullable: true })
  creditHour: string;
}