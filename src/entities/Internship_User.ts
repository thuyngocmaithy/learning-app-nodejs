import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Internship } from "./Internship";
import { Faculty } from "./Faculty";
import { User } from "./User";

/**
 * Thực thể user đăng ký thực tập
 */
@Entity()
export class Internship_User {
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
     * ID user (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    /**
     * Trạng thái được duyệt (mặc định: false, không rỗng)
     */
    @Column({ default: false, nullable: false })
    isApprove: boolean;
}