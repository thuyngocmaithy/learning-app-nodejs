import {
	Entity,
	ManyToOne,
	JoinColumn,
	PrimaryGeneratedColumn,
	Index,
	ManyToMany,
	JoinTable,
	Column,
} from 'typeorm';
import { StudyFrame_Component } from './StudyFrame';
import { Subject } from './Subject';
import { Semester } from './Semester';

/**
 * Thực thể môn học thuộc: thành phần khung đào tạo, chuyên ngành
 */
@Entity('subject_studyFrameComp')
@Index('IDX_SUBJECT_STUDYFRAMECOMP_SUBJECTID', ['subject']) // Chỉ mục cho cột subjectId
@Index('IDX_SUBJECT_STUDYFRAMECOMP_STUDYFRAMECOMPONENTID', ['studyFrameComponent']) // Chỉ mục cho cột studyFrameComponentId
export class Subject_StudyFrameComp {
	/**
	 * Khóa chính tự động tạo
	 */
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/**
	 * Mã môn học
	 */
	@ManyToOne(() => Subject, (subject) => subject.subjectId, { nullable: false })
	@JoinColumn({ name: 'subjectId' })
	subject: Subject;

	/**
	 * Mã thành phần Khung ctr đào tạo
	 */
	@ManyToOne(() => StudyFrame_Component, (studyFrame_Component) => studyFrame_Component.frameComponentId, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'studyFrameComponentId', referencedColumnName: 'frameComponentId' })
	studyFrameComponent: StudyFrame_Component;

	/**
	 * Số thứ tự (không rỗng)
	 */
	@Column('int', { default: 0, nullable: false })
	orderNo: number;

	/**
	 * Danh sách học kỳ thực hiện (Many-to-Many)
	 */
	@ManyToMany(() => Semester, (semester) => semester.subjectStudyFrameComponents)
	@JoinTable({
		name: 'subject_studyFrameComp_semester', // Tên bảng trung gian các học kỳ thực hiện môn học theo khối kiến thức
		joinColumn: {
			name: 'subjectStudyFrameCompId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'semesterId',
			referencedColumnName: 'semesterId',
		},
	})
	semesters: Semester[];
}
