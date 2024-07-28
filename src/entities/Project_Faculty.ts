import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./Project";
import { Internship_Faculty } from "./Internship_Faculty";
import { Faculty } from "./Faculty";

/**
 * Thực thể Dự án - Khoa
 */
@Entity()
export class Project_Faculty {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID dự án (tham chiếu đến thực thể Project, không rỗng)
     */
    @ManyToOne(() => Project, data => data.id, { nullable: false })
    project: Project;

    /**
     * ID khoa (tham chiếu đến thực thể Faculty, không rỗng)
     */
    @ManyToOne(() => Internship_Faculty, data => data.id, { nullable: false })
    faculty: Faculty;
}