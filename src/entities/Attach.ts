import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { ScientificResearch } from './ScientificResearch';
import { Thesis } from './Thesis';

/**
 * Thực thể Đính kèm
 */
@Entity()
export class Attach {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //   /**
  //  * Tên code tập tin (không rỗng)
  //  */
  //   @Column({ nullable: false })
  //   code: string;

  /**
   * Tên tập tin (không rỗng)
   */
  @Column({ nullable: false })
  filename: string;

  /**
   * Đường dẫn tập tin (không rỗng)
   */
  @Column({ nullable: false })
  link: string;

  /**
   * ID khóa luận (tham chiếu đến thực thể Thesis, có thể rỗng)
   */
  @ManyToOne(() => Thesis, data => data.id, { nullable: true })
  thesis: Thesis;

  /**
   * ID dự án (tham chiếu đến thực thể ScientificResearch, có thể rỗng)
   */
  @ManyToOne(() => ScientificResearch, data => data.scientificResearchId, { nullable: true })
  @JoinColumn({ name: 'scientificResearchId' })
  scientificResearch: ScientificResearch;

  /**
   * ID người tạo (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;

  /**
   * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: true })
  lastModifyUser: User;

  /**
   * Ngày chỉnh sửa cuối cùng (không rỗng)
   */
  @UpdateDateColumn()
  lastModifyDate: Date;
}