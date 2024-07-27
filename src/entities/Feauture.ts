import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { Permission } from './Permission';

// Chức năng
@Entity()
export class Feature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  featureId!: string;

  @Column()
  menuId!: string;

  @Column()
  order!: number;

  @Column()
  displayName!: string;

  @Column()
  url!: string;

  @ManyToMany(() => Permission)
  @JoinTable({ name: 'feature_permissions' })
  permissions!: Permission[];

  @ManyToOne(() => Feature, feature => feature.children, { nullable: true })
  parent!: Feature | null;

  @OneToMany(() => Feature, feature => feature.parent)
  children!: Feature[];

  @Column({ nullable: true })
  parentId!: number | null;

  @Column({ default: false })
  isParent!: boolean;
}