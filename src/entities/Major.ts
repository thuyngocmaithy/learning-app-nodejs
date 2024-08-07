import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

/**
 * Thực thể chuyên ngành
 */
@Entity()
export class Major {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Mã chuyên ngành (duy nhất, không rỗng)
     */
    @Column({ unique: true, nullable: false })
    majorId: string;

    /**
     * Tên chuyên ngành (không rỗng)
     */
    @Column({ nullable: false })
    majorName: string;

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
