import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Cycle } from './Cycle';
import { Major } from './Major';


/**
 * Thực thể Khung đào tạo
 * Một khung đào tạo có thể thuộc nhiều chu kỳ  
 * Một khung đào tạo có thể áp dụng cho nhiều chuyên ngành
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

  /**
   * Liên kết với nhiều chu kỳ
   * Nhớ đổi lại nulable false
   */
  @ManyToMany(() => Cycle)
  @JoinTable({
    name: 'StudyFrame_Cycle',
    joinColumn: { name: 'frameId', referencedColumnName: 'frameId' },
    inverseJoinColumn: { name: 'cycleId', referencedColumnName: 'cycleId' },
  })
  cycles: Cycle[];

  /**
   * Khung ctr đào tạo áp dụng được cho nhiều ngành
   */
  @ManyToMany(() => Major)
  @JoinTable({
    name: 'studyFrame_major',
    joinColumn: { name: 'frameId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'majorId', referencedColumnName: 'majorId' },
  })
  majors: Major[];
}