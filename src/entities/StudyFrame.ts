import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';

/**
 * Thực thể Khung đào tạo
 */
@Entity()
export class StudyFrame {
  /**
   * Mã khung (duy nhất, không rỗng)
   */
  @PrimaryColumn({ type: 'varchar', length: 25 })
  frameId: string;

  /**
   * Tên khung
   */
  @Column({ nullable: false })
  frameName: string;
}

/**
 * Thực thể thành phần khung đào tạo
 */
@Entity("studyFrame_component")
export class StudyFrame_Component {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã thành phần khung (duy nhất, không rỗng)
   */
  @Column({ unique: true, nullable: false })
  frameComponentId: string;

  /**
   * Tên thành phần khung (không rỗng)
   */
  @Column({ nullable: false })
  frameComponentName: string;


  /**
   * Mô tả (có thể rỗng)
   */
  @Column({ nullable: false })
  description: string;

  /**
   * Số tín chỉ yêu cầu, có thể rỗng
   */
  @Column({ nullable: true })
  creditHour: string;
}