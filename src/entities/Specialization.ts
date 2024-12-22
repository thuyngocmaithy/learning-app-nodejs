import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Major } from './Major';

/**
 * Thực thể chuyên ngành
 * Liên kết với 1 ngành
 */
@Entity()
export class Specialization {
    /**
     * Mã chuyên ngành (duy nhất, không rỗng)
     */
    @PrimaryColumn({ type: 'varchar', length: 25 })
    specializationId: string;

    /**
     * Tên chuyên ngành (không rỗng)
     */
    @Column({ nullable: false })
    specializationName: string;


    /**
     * Mã ngành
     */
    @ManyToOne(() => Major, data => data.majorId, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: 'majorId' })
    major: Major;

    /**
     * Số thứ tự (không rỗng)
     */
    @Column('int', { nullable: false })
    orderNo: number;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;
}
