import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Thesis } from './Thesis';
import { Project } from './Project';

/**
 * Thực thể cuộc hội thoại
 */
@Entity()
export class Conversation {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID khóa luận (tham chiếu đến thực thể Thesis, có thể rỗng)
     */
    @ManyToOne(() => Thesis, data => data.id, { nullable: true })
    thesis: Thesis;

    /**
     * ID dự án (tham chiếu đến thực thể Project, có thể rỗng)
     */
    @ManyToOne(() => Project, data => data.projectId, { nullable: true })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;
}
