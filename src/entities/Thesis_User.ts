import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Thesis } from "./Thesis";
import { User } from "./User";

/**
 * Thực thể user đăng ký khóa luận
 */
@Entity()
export class Thesis_User {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID dự án (tham chiếu đến thực thể Thesis, không rỗng)
     */
    @ManyToOne(() => Thesis, data => data.id, { nullable: false })
    thesis: Thesis;

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