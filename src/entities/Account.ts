import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { Permission } from './Permission';

// Tài khoản
@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true })
    refreshToken!: string;

    // @OneToOne(() => User, user => user.account)
    // user!: User;

    @OneToMany(() => Permission, p => p.account)
    permissions: Permission[];
}