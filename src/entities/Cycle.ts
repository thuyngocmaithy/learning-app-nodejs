import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
import { Semester } from './Semester';

/**
 * Quản lý các chu kỳ học
 * Một chu kỳ có thể chứa nhiều học kỳ
 */
@Entity()
export class Cycle {
    /**
     * Khóa chính
     */
    @PrimaryColumn({ type: 'varchar', length: 25 })
    cycleId: string;

    /**
     * Tên chu kỳ (không rỗng)
     */
    @Column({ nullable: false })
    cycleName: string;

    /**
     * Năm bắt đầu chu kỳ
     */
    @Column({ type: 'int', width: 4, nullable: false })
    startYear: number;

    /**
     * Năm kết thúc chu kỳ
     */
    @Column({ type: 'int', width: 4, nullable: false })
    endYear: number;

    /**
     * Danh sách học kỳ trong chu kỳ này
     * Many-to-Many với bảng Semester
     */
    @ManyToMany(() => Semester, semester => semester.cycles, { cascade: true, onDelete: 'CASCADE' })
    semesters: Semester[];
}
