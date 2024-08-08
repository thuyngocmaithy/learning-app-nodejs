import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

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

    /**
     * ID người tạo (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.id, { nullable: true })
    createUser: User;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;

    /**
     * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.id, { nullable: true })
    lastModifyUser: User;

    /**
     * Ngày chỉnh sửa cuối cùng (không rỗng)
     */
    @UpdateDateColumn()
    lastModifyDate: Date;
}