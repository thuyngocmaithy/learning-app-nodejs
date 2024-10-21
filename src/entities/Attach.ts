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
   * ID khóa luận (tham chiếu đến thực thể Thesis, có thể rỗng)
   */
  @ManyToOne(() => Thesis, data => data.thesisId, { nullable: true })
  @JoinColumn({ name: 'thesisId' })
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
  @JoinColumn({ name: 'createUserId' })
  createUser: User;

  /**
   * Ngày tạo (không rỗng)
   */
  @CreateDateColumn()
  createDate: Date;
}