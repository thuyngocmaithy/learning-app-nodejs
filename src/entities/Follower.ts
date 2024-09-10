import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { User } from './User'; // Replace with your User entity
import { Internship } from './Internship';
import { Project } from './Project';
import { Thesis } from './Thesis';

/**
 * Thực thể Người theo dõi
 */
@Entity()
@Unique(["internship", "project", "thesis"])
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
  // @ManyToOne(() => Project, data => data.projectId, { nullable: true })
  // @JoinColumn({ name: 'projectId' })
  // project: Project;

  @ManyToOne(() => Project, project => project.follower, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;


  /**
   * ID dự án (tham chiếu đến thực thể Khóa luận, có thể rỗng)
   */
  @ManyToOne(() => Thesis, data => data.id, { nullable: true })
  thesis: Thesis;

  // Thêm cascade: true để xóa liên quan đến FollowerDetail khi xóa Follower
  @OneToMany(() => FollowerDetail, followerDetail => followerDetail.follower, { cascade: ['insert', 'update', 'remove'] })
  followerDetails: FollowerDetail[];
}

/**
 * Thực thể Chi tiết người theo dõi
 */
@Entity()
@Unique(["follower", "user"])
export class FollowerDetail {
  /**
   * Khóa chính
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID người theo dõi (tham chiếu đến thực thể Follower, không rỗng)
   */
  // @ManyToOne(() => Follower, data => data.id, { nullable: false })
  // follower: Follower;

  @ManyToOne(() => Follower, follower => follower.followerDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: Follower;

  /**
   * ID người dùng (tham chiếu đến thực thể User, không rỗng)
   */
  @ManyToOne(() => User, data => data.userId, { nullable: true })
  user: User;
}