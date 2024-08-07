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
   * Tên khung (không rỗng)
   */
  @Column({ nullable: false })
  frameName: string;

  /**
   * Có chia ra cơ sở và chuyên không, mặc định: không, không rỗng
   */

  @Column({ nullable: false })
  description: string;

  // /**
  //  * có chia (không rỗng)
  //  */

  @Column({ default: false, nullable: false })
  isDivide: boolean;

}