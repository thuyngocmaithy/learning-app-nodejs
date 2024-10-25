import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { Semester } from './Semester';

/**
 * Quản lý các chu kỳ học
 * Một chu kỳ có thể chứa nhiều học kỳ
 */
@Entity()
export class Cycle {
    @PrimaryColumn({ type: 'varchar', length: 25 })
    cycleId: string;

    /**
     * Tên chu kỳ (không rỗng)
     */
    @Column({ nullable: false })
    cycleName: string;


    @Column({ type: 'int', width: 4, nullable: false })
    startYear: number;

    @Column({ type: 'int', width: 4, nullable: false })
    endYear: number;

    /**
     * Danh sách học kỳ thuộc chu kỳ này
     */
    @OneToMany(() => Semester, semester => semester.cycle)
    semesters: Semester[];
}
