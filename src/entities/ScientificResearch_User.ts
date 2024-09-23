import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ScientificResearch } from "./ScientificResearch";
import { User } from "./User";

/**
 * Thực thể user đăng ký dự án
 */
@Entity()
@Unique(["scientificResearch", "user"])
export class ScientificResearch_User {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID dự án (tham chiếu đến thực thể ScientificResearch, không rỗng)
     */
    @ManyToOne(() => ScientificResearch, data => data.scientificResearchId, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'scientificResearchId' })
    scientificResearch: ScientificResearch;

    /**
     * ID user (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: false })
    @JoinColumn({ name: 'userId' })
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