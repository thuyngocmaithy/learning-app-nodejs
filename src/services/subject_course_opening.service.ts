import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { Subject_Course_Opening } from '../entities/Subject_Course_Opening';
import { StudyFrame } from '../entities/StudyFrame';
import { Subject } from '../entities/Subject';
import { Semester } from '../entities/Semester';
import { Cycle } from '../entities/Cycle';

export class Subject_Course_OpeningService {
	private subject_course_openingRepository: Repository<Subject_Course_Opening>;
	private subjectRepository: Repository<Subject>;
	private studyFrameRepository: Repository<StudyFrame>;
	private semesterRepository: Repository<Semester>;
	private cycleRepository: Repository<Cycle>;

	constructor(dataSource: DataSource) {
		this.subject_course_openingRepository = dataSource.getRepository(Subject_Course_Opening);
		this.subjectRepository = dataSource.getRepository(Subject);
		this.studyFrameRepository = dataSource.getRepository(StudyFrame);
		this.semesterRepository = dataSource.getRepository(Semester);
		this.cycleRepository = dataSource.getRepository(Cycle);
	}

	async getAll(): Promise<Subject_Course_Opening[]> {
		return this.subject_course_openingRepository
			.createQueryBuilder('subject_course_opening')
			.leftJoinAndSelect('subject_course_opening.subject', 'subject')
			.leftJoinAndSelect('subject_course_opening.studyFrame', 'studyFrame')
			.leftJoinAndSelect('subject_course_opening.semester', 'semester')
			.leftJoinAndSelect('studyFrame.faculty', 'faculty')
			.leftJoinAndSelect('studyFrame.cycle', 'cycle')
			.select([
				'studyFrame.frameId as studyFrameId',
				'studyFrame.frameName as studyFrameName',
				'faculty.facultyId as facultyId',
				'faculty.facultyName as facultyName',
				'cycle.cycleId as cycleId',
				'cycle.cycleName as cycleName',
				'subject_course_opening.disabled as disabled',
				'MAX(subject_course_opening.id) AS id', // Hoặc các hàm tổng hợp khác
			])
			.groupBy('subject_course_opening.studyFrame, subject_course_opening.disabled')
			.getRawMany();
	}

	async getById(id: string): Promise<Subject_Course_Opening | null> {
		return this.subject_course_openingRepository.findOne({
			where: { id },
			relations: [
				'subject',
				'studyFrame',
				'semester'
			]
		});
	}

	public create = async (data: any): Promise<Subject_Course_Opening> => {
		const subject = await this.subjectRepository.findOne({ where: { subjectId: data.subject } });
		if (!subject) {
			throw new Error('Invalid subject ID');
		}

		const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: data.studyFrame } });
		if (!studyFrame) {
			throw new Error('Invalid studyFrame ID');
		}

		const semester = await this.semesterRepository.findOne({ where: { semesterId: data.semester } });
		if (!semester) {
			throw new Error('Invalid semester ID');
		}

		const cycle = await this.cycleRepository.findOne({ where: { cycleId: data.cycle } });
		if (!cycle) {
			throw new Error('Invalid cycle ID');
		}

		const subject_course_opening = this.subject_course_openingRepository.create({
			subject: subject,
			instructor: data.instructor,
			studyFrame: studyFrame,
			cycle: cycle,
			semester: semester
		});

		const savedSubject_Course_Opening = await this.subject_course_openingRepository.save(subject_course_opening);

		return savedSubject_Course_Opening;
	}

	public saveMulti = async (data: any[]): Promise<Subject_Course_Opening[]> => {
		try {
			const savedSubjectCourseOpenings: Subject_Course_Opening[] = [];

			// Lấy danh sách tất cả Subject_Course_Opening hiện có trong cơ sở dữ liệu
			const existingSubjectCourseOpenings = await this.subject_course_openingRepository.find({
				relations: ['cycle', 'subject', 'studyFrame', 'semester']
			});

			for (const item of data) {
				// Kiểm tra xem bản ghi có tồn tại trong cơ sở dữ liệu không
				const existingRecord = existingSubjectCourseOpenings.find(existing =>
					existing.subject.subjectId === item.subject &&
					existing.studyFrame.frameId === item.studyFrame &&
					existing.cycle === item.cycle &&
					existing.semester.semesterId === item.semester
				);

				if (existingRecord) {
					// Nếu bản ghi đã tồn tại và có sự khác biệt về instructor, cập nhật instructor
					if (existingRecord.instructor !== item.instructor) {
						existingRecord.instructor = item.instructor; // Cập nhật instructor
						const updatedRecord = await this.subject_course_openingRepository.save(existingRecord);
						savedSubjectCourseOpenings.push(updatedRecord);
					}
					// Nếu instructor giống nhau, không làm gì cả
					continue;
				} else {
					// Nếu bản ghi không có, tạo mới và lưu vào cơ sở dữ liệu
					const subjectCourseOpening = this.subject_course_openingRepository.create({
						subject: item.subject,
						instructor: item.instructor,
						studyFrame: item.studyFrame,
						cycle: item.cycle,
						semester: item.semester
					});

					const savedRecord = await this.subject_course_openingRepository.save(subjectCourseOpening);
					savedSubjectCourseOpenings.push(savedRecord);
				}
			}

			// Xóa những bản ghi cũ không có trong yêu cầu
			for (const existingRecord of existingSubjectCourseOpenings) {
				const match = data.find(item =>
					item.subject === existingRecord.subject.subjectId &&
					item.instructor === existingRecord.instructor &&
					item.studyFrame === existingRecord.studyFrame.frameId &&
					item.cycle === existingRecord.cycle.cycleId &&
					item.semester === existingRecord.semester.semesterId
				);

				if (!match) {
					// Nếu không có trong yêu cầu, xóa bản ghi
					await this.subject_course_openingRepository.remove(existingRecord);
				}
			}

			return savedSubjectCourseOpenings;
		} catch (error) {
			console.error('Error in saveMulti service:', error);
			throw new Error('Unable to create, update, or delete Subject_Course_Opening entries.');
		}
	};




	async update(id: string, data: any): Promise<Subject_Course_Opening | null> {
		const subject_course_opening = await this.subject_course_openingRepository.findOne({ where: { id } });
		if (!subject_course_opening) {
			return null;
		}
		if (data.subject) {
			const subject = await this.subjectRepository.findOne({ where: { subjectId: data.subject } });
			if (!subject) {
				throw new Error('Invalid subject ID');
			}
			data.subject = subject;
		}

		if (data.studyFrame) {
			const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: data.studyFrame } });
			if (!studyFrame) {
				throw new Error('Invalid studyFrame ID');
			}
			data.studyFrame = studyFrame;
		}

		if (data.semester) {
			const semester = await this.semesterRepository.findOne({ where: { semesterId: data.semester } });
			if (!semester) {
				throw new Error('Invalid semester ID');
			}
			data.semester = semester;
		}


		this.subject_course_openingRepository.merge(subject_course_opening, data);
		return this.subject_course_openingRepository.save(subject_course_opening);
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.subject_course_openingRepository.delete({ id: In(ids) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}


	async deleteSubjectCourseOpening(cycleId: string, studyFrameId: string): Promise<boolean> {
		try {
			// Xóa các bản ghi theo year và studyFrameId
			const result = await this.subject_course_openingRepository.delete({
				cycle: { cycleId: cycleId },
				studyFrame: { frameId: studyFrameId },
			});

			return result.affected !== null && result.affected !== undefined && result.affected > 0;
		} catch (error) {
			console.error('Error in deleteSubjectCourseOpeningService:', error);
			throw new Error('Service error');
		}
	};

	async getWhere(condition: any): Promise<Subject_Course_Opening[]> {
		const whereCondition: any = {};

		if (condition.subject) {
			whereCondition.subject = { subjectId: condition.subject }
		}
		if (condition.studyFrame) {
			whereCondition.studyFrame = { frameId: condition.studyFrame }
		}

		if (condition.year) {
			whereCondition.year = condition.year;
		}

		if (condition.semester) {
			whereCondition.semester = { semesterId: condition.semester };
		}

		return this.subject_course_openingRepository.find({
			where: whereCondition,
			relations: [
				'subject',
				'studyFrame',
				'semester'
			],
		});
	}

	public async getTeacherAssignmentsAndSemesters() {
		try {
			const subjectCourseOpenings = await this.subject_course_openingRepository.find({
				relations: ['subject', 'semester', 'studyFrame'],
			});

			const teacherAssignments = new Map<string, string>();
			const selectedSemesters = new Set<string>();

			subjectCourseOpenings.forEach((item) => {
				const key = `${item.semester.semesterId}-${item.subject.subjectId}`;
				if (item.instructor) {
					teacherAssignments.set(key, item.instructor);
				}
				selectedSemesters.add(key);
			});

			return { teacherAssignments, selectedSemesters };
		} catch (error) {
			console.error('Error fetching data from database:', error);
			throw new Error('Error fetching data from database');
		}
	}

}

