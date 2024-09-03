import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

/**
 * Thực thể user đăng ký dự án
 */
@Entity()
@Unique(["project", "user"])
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
    @JoinColumn({ name: 'projectId' })
    project: Project;

    /**
     * ID user (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: false })
    user: User;

    /**
     * Nhóm (có thể rỗng)
     */
    @Column({ nullable: true })
    group: number;

    /**
     * Nhóm trưởng (có thể rỗng)
     */
    @Column({ nullable: true })
    isLeader: boolean;

    /**
     * Trạng thái được duyệt (mặc định: false, không rỗng)
     */
    @Column({ default: false, nullable: false })
    isApprove: boolean;
}