import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

/**
 * Thực thể Loại trạng thái
 */
@Entity()
export class Status {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Mã trạng thái (duy nhất, không rỗng)
     */
    @Column({ unique: true, nullable: false })
    statusId: string;

    /**
     * Tên trạng thái (không rỗng)
     */
    @Column({ nullable: false })
    statusName: string;

    @Column({
        type: 'enum',
        enum: ['Tiến độ dự án nghiên cứu', 'Tiến độ khóa luận', 'Tiến độ thực tập'],
    })
    type: 'Tiến độ dự án nghiên cứu' | 'Tiến độ khóa luận' | 'Tiến độ thực tập' = "Tiến độ dự án nghiên cứu";

    /**
         * Số thứ tự (không rỗng)
         */
    @Column('int', { nullable: false })
    orderNo: number;

    /**
     * ID người tạo (tham chiếu đến thực thể User, không rỗng)
     */
    @ManyToOne(() => User, data => data.id, { nullable: false })
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
