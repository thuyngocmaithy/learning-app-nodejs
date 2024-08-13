import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Internship } from './Internship';
import { Project } from './Project';

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
   * ID thực tập (tham chiếu đến thực thể Internship, có thể rỗng)
   */
  @ManyToOne(() => Internship, data => data.id, { nullable: true })
  internship: Internship;

  /**
   * ID dự án (tham chiếu đến thực thể Project, có thể rỗng)
   */
  @ManyToOne(() => Project, data => data.projectId, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

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