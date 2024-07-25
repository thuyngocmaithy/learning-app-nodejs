import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('account')
export class Account {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'varchar', length: 255 })
    mssv!: string;
}
