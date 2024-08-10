import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Thực thể Khoa
 */
@Entity()
export class Faculty {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Mã khoa (duy nhất, không rỗng)
     */
    @Column({ unique: true, nullable: false })
    facultyId: string;

    /**
     * Tên khoa (không rỗng)
     */
    @Column({ nullable: false })
    facultyName: string;
}