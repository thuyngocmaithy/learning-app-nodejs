import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Faculty } from './Faculty';

/**
 * Thực thể chuyên ngành
 * Liên kết với 1 khoa
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
}
