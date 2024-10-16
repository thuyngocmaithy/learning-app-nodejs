import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Faculty } from './Faculty';
import { Cycle } from './Cycle';

/**
 * Thực thể chuyên ngành
 * Liên kết với 1 khoa và thuộc nhiều chu kỳ
 */
@Entity()
export class Major {
    /**
     * Mã chuyên ngành (duy nhất, không rỗng)
     */
    @PrimaryColumn({ type: 'varchar', length: 25 })
    majorId: string;

    /**
     * Tên chuyên ngành (không rỗng)
     */
    @Column({ nullable: false })
    majorName: string;

    /**
     * Số thứ tự (không rỗng)
     */
    @Column('int', { nullable: false })
    orderNo: number;

    /**
     * Mã khoa
     */
    @ManyToOne(() => Faculty, data => data.facultyId, { nullable: true })
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;

    /**
     * Liên kết với nhiều chu kỳ
     */
    @ManyToMany(() => Cycle)
    @JoinTable({
        name: 'Major_Cycle',
        joinColumn: { name: 'majorId', referencedColumnName: 'majorId' },
        inverseJoinColumn: { name: 'cycleId', referencedColumnName: 'cycleId' },
    })
    cycles: Cycle[];
}
