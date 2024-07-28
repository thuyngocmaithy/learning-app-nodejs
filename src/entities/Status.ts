import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
     * Mô tả (không rỗng)
     */
    @Column({ nullable: false })
    description: string;
}
