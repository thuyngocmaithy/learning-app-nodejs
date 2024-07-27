import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Account } from './Account';

// Quyền
@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  permissionId!: string;

  @Column()
  permissionName!: string;

  @ManyToOne(() => Account, (a) => a.permissions)
  account: Account

  // @Column()
  // permissionCode!: string;


}