import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import { Cycle } from './Cycle';
import { Subject_StudyFrameComp } from './Subject_StudyFrameComp';

/**
 * Thực thể Học kỳ
 * Một học kỳ có thể thuộc nhiều chu kỳ
 */
@Entity()
@Index("IDX_SEMESTER_ACADEMIC_YEAR", ["academicYear"])  // Chỉ mục cho cột academicYear
@Index("IDX_SEMESTER_NAME", ["semesterName"])  // Chỉ mục cho cột semesterName
export class Semester {

	/**
	 * Khóa chính
	 */
	@PrimaryColumn({ type: 'varchar', length: 25 })
	semesterId: string;

	/**
	 * Tên học kỳ
	 */
	@Column('int')
	semesterName: number;

	/**
	 * Năm học (duy nhất, không rỗng)
	 */
	@Column({ type: 'int', width: 4, nullable: false })
	academicYear: number;

	/**
	 * Chu kỳ học tập
	 * Một học kỳ có thể thuộc nhiều chu kỳ
	 */
	@ManyToMany(() => Cycle, cycle => cycle.semesters)
	@JoinTable({
		name: 'semester_cycle', // Tên bảng liên kết
		joinColumn: {
			name: 'semesterId',
			referencedColumnName: 'semesterId',
		},
		inverseJoinColumn: {
			name: 'cycleId',
			referencedColumnName: 'cycleId',
		},
	})
	cycles: Cycle[];

	@ManyToMany(() => Subject_StudyFrameComp, subjectStudyFrameComp => subjectStudyFrameComp.semesters)
	subjectStudyFrameComponents: Subject_StudyFrameComp[];
}
