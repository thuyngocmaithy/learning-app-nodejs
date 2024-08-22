import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './Conversation';
import { User } from './User';

/**
 * Thực thể người tham gia cuộc hội thoại
 */
@Entity()
export class Participant {
    /**
     * Khóa chính
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * ID cuộc hội thoại (tham chiếu đến thực thể Conversation, không rỗng)
     */
    @ManyToOne(() => Conversation, data => data.id, { nullable: false })
    conversation: Conversation;

    /**
     * ID người dùng (tham chiếu đến thực thể User, có thể rỗng)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;
}
