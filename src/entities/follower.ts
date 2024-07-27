import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { User } from './User'; // Replace with your User entity
import { Internship } from './Intern';
import { Project } from './Project';
import { Thesis } from './Thesis';

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