import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Thesis } from './Thesis';
import { ScientificResearch } from './ScientificResearch';

/**
 * Thực thể tin nhắn
 */
@Entity()
export class Message {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Mã người gửi
     */
    @ManyToOne(() => User, data => data.userId, { nullable: true })
    @JoinColumn({ name: 'senderId' })
    sender: User;

    /**
     * Nội dung
     */
    @Column({ nullable: false })
    content: string;

    // /**
    //  * Mã cuộc hội thoại, không null
    //  */
    // @ManyToOne(() => Conversation, data => data.id, { nullable: false })
    // conversation: Conversation;

    /**
     * ID khóa luận (tham chiếu đến thực thể Thesis, có thể rỗng)
     */
    @ManyToOne(() => Thesis, data => data.thesisId, { nullable: true })
    @JoinColumn({ name: 'thesiId' })
    thesis: Thesis;

    /**
     * ID dự án (tham chiếu đến thực thể ScientificResearch, có thể rỗng)
     */
    @ManyToOne(() => ScientificResearch, data => data.scientificResearchId, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: 'scientificResearchId' })
    scientificResearch: ScientificResearch;

    /**
     * Trạng thái đã xem (mặc định: false, không rỗng)
     */
    @Column({ default: false, nullable: false })
    isSeen: boolean;

    /**
     * Ngày tạo (không rỗng)
     */
    @CreateDateColumn()
    createDate: Date;

    /**
     * Ngày chỉnh sửa cuối cùng (không rỗng)
     */
    @UpdateDateColumn()
    lastModifyDate: Date;
}
