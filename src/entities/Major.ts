import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Faculty } from './Faculty';

/**
 * Thực thể ngành
 * Liên kết với 1 khoa
 */
@Entity()
export class Major {
    /**
     * Mã ngành (duy nhất, không rỗng)
     */
    @PrimaryColumn({ type: 'varchar', length: 25 })
    majorId: string;

    /**
     * Tên ngành (không rỗng)
     */
    @Column({ nullable: false })
    majorName: string;

    /**
     * Mã khoa
     */
    @ManyToOne(() => Faculty, data => data.facultyId, { nullable: true })
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;

    /**
     * Số tín chỉ của ngành (không rỗng)
     */
    @Column({ nullable: false, default: 0 })
    creditHourTotal: number;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;
}
