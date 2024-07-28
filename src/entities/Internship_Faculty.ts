import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Internship } from "./Internship";
import { Faculty } from "./Faculty";

/**
 * Thực thể Thực tập - Khoa
 */
@Entity()
export class Internship_Faculty {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID thực tập (tham chiếu đến thực thể Internship, không rỗng)
     */
    @ManyToOne(() => Internship, data => data.id, { nullable: false })
    internship: Internship;

    /**
     * ID khoa (tham chiếu đến thực thể Faculty, không rỗng)
     */
    @ManyToOne(() => Faculty, data => data.id, { nullable: false })
    faculty: Faculty;
}