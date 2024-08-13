import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User'; // Replace with your User entity
import { Internship } from './Internship';
import { Project } from './Project';
import { Thesis } from './Thesis';

/**
 * Thực thể Người theo dõi
 */
@Entity()
export class Follower {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
   * ID dự án (tham chiếu đến thực thể Khóa luận, có thể rỗng)
   */
  @ManyToOne(() => Thesis, data => data.id, { nullable: true })
  thesis: Thesis;
}

/**
 * Thực thể Chi tiết người theo dõi
 */
@Entity()
export class FollowerDetail {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID người theo dõi (tham chiếu đến thực thể Follower, không rỗng)
   */
  @ManyToOne(() => Follower, data => data.id, { nullable: false })
  follower: Follower;

  /**
   * ID người dùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: false })
  user: User;
}