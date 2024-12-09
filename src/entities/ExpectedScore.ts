import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Subject } from './Subject';

/**
 * Thực thể Điểm Dự Kiến
 * Lưu trữ các điểm và chỉ số học tập dự kiến của sinh viên
 */
@Entity()
@Unique(['student', 'subject'])
export class ExpectedScore {
    /**
     * Khóa chính tự động sinh
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Điểm dự kiến hệ 10
     */
    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    expectedScore10: number | null;

    /**
     * Điểm dự kiến hệ 4
     */
    // @Column('decimal', { precision: 5, scale: 2, nullable: true })
    // expectedScore4: number | null;

    /**
     * Điểm chữ dự kiến
     */
    @Column('varchar', { length: 10, nullable: true })
    expectedScoreLetter: string | null;


    /**
     * Điểm trung bình tích lũy dự kiến
     */
    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    expectedGPA: number | null;

    /**
     * Số tín chỉ của ngành 
     */
    @Column({ nullable: true, default: 0 })
    expectedCreditHourTotal: number;

    /**
     * Số tín chỉ dự kiến đạt loại A B C D F
     */
    @Column('varchar', { nullable: true })
    expectedCreditType: number | null;

    /**
     * Tham chiếu đến sinh viên (User)
     */
    @ManyToOne(() => User, data => data.userId, { nullable: false })
    @JoinColumn({ name: 'studentId' })
    student: User;

    /**
     * Tham chiếu đến môn học
     */
    @ManyToOne(() => Subject, data => data.subjectId, { nullable: false })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;



}