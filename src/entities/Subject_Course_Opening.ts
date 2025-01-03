import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';
import { Subject } from './Subject';
import { Semester } from './Semester';
import { Major } from './Major';

/**
 * Mở học phần: 1 môn có thể được mở nhiều năm, nhiều giảng viên dạy
 */
@Entity('subject_course_opening')
@Index("IDX_SUBJECT", ["subject"])  // Chỉ mục composite cho subjectId 
@Index("IDX_SEMESTER", ["semester"])  // Chỉ mục composite cho semesterId
export class Subject_Course_Opening {
	/**
	 * Khóa chính tự động tạo
	 */
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/**
	 * Mã môn học
	 */
	@ManyToOne(() => Subject, subject => subject.subjectId, { nullable: false })
	@JoinColumn({ name: 'subjectId' })
	subject: Subject;

	/**
	 * Học kỳ mở
	 */
	@ManyToOne(() => Semester, semester => semester.semesterId, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'semesterId', referencedColumnName: 'semesterId' })
	semester: Semester;

	/**
	 * Ngành
	 */
	@ManyToOne(() => Major, major => major.majorId, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'majorId', referencedColumnName: 'majorId' })
	major: Major;

	/**
	 * Số nhóm mở
	 */
	@Column('int', { default: 0, nullable: false })
	openGroup: number;

	/**
	 * SL SV / 1 nhóm
	 */
	@Column('int', { default: 0, nullable: false })
	studentsPerGroup: number;

	/**
	 * Danh sách giảng viên, lưu dưới dạng mảng chuỗi, phân tách bằng dấu phẩy.
	 */
	@Column('simple-array', { nullable: true })
	instructors: string[];

	/**
	 * Trạng thái ẩn giảng viên dạy
	 */
	@Column({ default: false, nullable: false })
	disabled: boolean;

	/**
	 * Ngày tạo (không rỗng)
	 */
	@CreateDateColumn()
	createDate: Date;
}
