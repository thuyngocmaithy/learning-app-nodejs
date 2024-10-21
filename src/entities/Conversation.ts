import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Thesis } from './Thesis';
import { ScientificResearch } from './ScientificResearch';

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
    @ManyToOne(() => Thesis, data => data.thesisId, { nullable: true })
    thesis: Thesis;

    /**
     * ID dự án (tham chiếu đến thực thể ScientificResearch, có thể rỗng)
     */
    @ManyToOne(() => ScientificResearch, data => data.scientificResearchId, { nullable: true })
    @JoinColumn({ name: 'scientificResearchId' })
    scientificResearch: ScientificResearch;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;
}
