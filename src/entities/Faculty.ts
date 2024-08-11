import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Thực thể Khoa
 */
@Entity()
export class Faculty {
    /**
     * Mã khoa (duy nhất, không rỗng)
     */
    @PrimaryColumn({ type: 'varchar', length: 25 })
    facultyId: string;

    /**
     * Tên khoa (không rỗng)
     */
    @Column({ nullable: false })
    facultyName: string;
}