import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Thesis } from "./Thesis";
import { User } from "./User";

/**
 * Thực thể user đăng ký khóa luận
 */
@Entity()
@Unique(["thesis", "user"])
export class Thesis_User {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID khóa luận (tham chiếu đến thực thể Thesis, không rỗng)
     */
    @ManyToOne(() => Thesis, data => data.thesisId, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thesisId' })
    thesis: Thesis;

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