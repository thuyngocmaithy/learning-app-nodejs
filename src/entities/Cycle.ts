import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StudyFrame } from './StudyFrame';
import { Major } from './Major';
import { Semester } from './Semester';

/**
 * Quản lý các chu kỳ học
 * Một chu kỳ có thể chứa nhiều học kỳ
 */
@Entity()
export class Cycle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
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
