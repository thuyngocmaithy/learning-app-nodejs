import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { User } from './user.entities'; // Replace with your User entity
import { Internship } from './intern.entities';
import { Project } from './project.entities';
import { Thesis } from './thesis.entities';

// Người theo dõi
@Entity()
export class Follower {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.following)
  follower!: User;

  @ManyToOne(() => User, user => user.followers)
  following!: User;

  @ManyToOne(() => Internship, internship => internship.followers, { nullable: true })
  internship?: Internship;

  @ManyToOne(() => Project, project => project.followers, { nullable: true })
  project?: Project;

  @ManyToOne(() => Thesis, thesis => thesis.followers, { nullable: true })
  thesis?: Thesis;
}