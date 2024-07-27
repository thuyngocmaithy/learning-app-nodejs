import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { Follower } from './Follower';
import { User } from './User';

// Dự án nghiên cứu
@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  projectId!: string;

  @Column()
  name!: string;

  @Column()
  status!: string;

  @ManyToOne(() => User, user => user.createdProjects)
  create_user: User = new User;

  @ManyToOne(() => User, user => user.updatedProjects)
  update_user: User = new User;

  @CreateDateColumn()
  createDate!: Date;

  @UpdateDateColumn()
  updateDate!: Date;

  @Column()
  start_Date!: Date;

  @Column()
  finish_Date!: Date;

  @Column()
  completion_time!: Date;

  @Column()
  description!: string;

  @OneToMany(() => Follower, follower => follower.project)
  followers!: Follower[];
}
