import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

/**
 * Thực thể user đăng ký dự án
 */
@Entity()
export class Project_User {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID dự án (tham chiếu đến thực thể Project, không rỗng)
     */
    @ManyToOne(() => Project, data => data.projectId, { nullable: false })
    project: Project;

    /**
     * ID user (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.id, { nullable: false })
    user: User;

    /**
     * Trạng thái được duyệt (mặc định: false, không rỗng)
     */
    @Column({ default: false, nullable: false })
    isApprove: boolean;
}