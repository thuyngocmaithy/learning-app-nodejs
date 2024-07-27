import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from './User';
import { Follower } from './Follower';


// Thực tập
@Entity()
export class Internship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => User, user => user.createdInternships)
  @JoinColumn()
  creater!: User;

  @ManyToOne(() => User, user => user.updatedInternships)
  @JoinColumn()
  updater!: User;

  @CreateDateColumn()
  create_date!: Date;

  @UpdateDateColumn()
  update_date!: Date;

  @Column()
  location!: string;

  @Column({ type: 'decimal' })
  salary!: number;

  @Column()
  internNumber!: number;

  @Column()
  type!: string;

  @Column()
  description!: string;

  @Column()
  major!: string;

  @Column()
  require!: string;

  @Column()
  benefit!: string;

  @OneToMany(() => Follower, follower => follower.internship)
  followers!: Follower[];
}