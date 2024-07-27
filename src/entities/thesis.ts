import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, OneToMany, BeforeInsert, BeforeUpdate, ManyToMany, JoinTable } from 'typeorm';
import { Follower } from './Follower';
import { User, UserRole } from './User';
// import { BadRequestException } from '@nestjs/common';

// Khóa luận
@Entity()
export class Thesis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @ManyToMany(() => User, user => user.authoredTheses)
  @JoinTable({ name: 'thesis_authors' })
  authors!: User[];

  @ManyToOne(() => User, user => user.supervisedTheses)
  supervisor!: User;

  @Column()
  description!: string;

  @CreateDateColumn()
  startDate!: Date;

  @Column({ nullable: true })
  endDate!: Date;

  @Column()
  status!: string;

  @OneToMany(() => Follower, follower => follower.thesis)
  followers!: Follower[];


  // @BeforeInsert()
  // @BeforeUpdate()
  // async validateRoles() {
  //   if (!this.authors.every(author => author.role === UserRole.STUDENT)) {
  //     throw new BadRequestException('All authors must have the role of student.');
  //   }
  //   if (this.supervisor.role !== UserRole.TEACHER) {
  //     throw new BadRequestException('The supervisor must have the role of teacher.');
  //   }
  // }


}