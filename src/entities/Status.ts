import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

/**
 * Thực thể Loại trạng thái
 */
@Entity()
export class Status {
    /**
     * Mã trạng thái (duy nhất, không rỗng)
     */
    @PrimaryColumn({ type: 'varchar', length: 25 })
    statusId: string;

    /**
     * Tên trạng thái (không rỗng)
     */
    @Column({ nullable: false })
    statusName: string;

    @Column({
        type: 'enum',
        enum: ['Tiến độ đề tài NCKH', 'Tiến độ khóa luận', 'Tiến độ thực tập', 'Tiến độ nhóm đề tài NCKH'],
    })
    type: 'Tiến độ đề tài NCKH' | 'Tiến độ khóa luận' | 'Tiến độ thực tập' | 'Tiến độ nhóm đề tài NCKH' = "Tiến độ đề tài NCKH";

    /**
     * Số thứ tự (không rỗng)
     */
    @Column('int', { nullable: false })
    orderNo: number;

    /**
     * ID người tạo (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: false })
    @JoinColumn({ name: 'createUserId' })
    createUser: User;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;

    /**
     * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: true })
    @JoinColumn({ name: 'lastModifyUserId' })
    lastModifyUser: User;

    /**
     * Ngày chỉnh sửa cuối cùng (không rỗng)
     */
    @UpdateDateColumn()
    lastModifyDate: Date;
}
