import { DataSource, Repository, Like, FindManyOptions, In, MoreThan, LessThanOrEqual } from 'typeorm';
import { Subject_Course_Opening } from '../entities/Subject_Course_Opening';
import { Subject } from '../entities/Subject';
import { Semester } from '../entities/Semester';
import { Major } from '../entities/Major';

export class Subject_Course_OpeningService {
	private subject_course_openingRepository: Repository<Subject_Course_Opening>;
	private subjectRepository: Repository<Subject>;
	private majorRepository: Repository<Major>;
	private semesterRepository: Repository<Semester>;

	constructor(dataSource: DataSource) {
		this.subject_course_openingRepository = dataSource.getRepository(Subject_Course_Opening);
		this.subjectRepository = dataSource.getRepository(Subject);
		this.majorRepository = dataSource.getRepository(Major);
		this.semesterRepository = dataSource.getRepository(Semester);
	}

	async getAll(): Promise<Subject_Course_Opening[]> {
		const data = await this.subject_course_openingRepository.find({
			relations: [
				'subject',
				'semester',
				'major'
			]
		});

		// Nhóm và chỉ giữ item đầu tiên
		const grouped = data.reduce((result: Record<string, Record<string, Subject_Course_Opening>>, item) => {
			const semesterName = item.semester?.semesterName || 'Unknown Semester';
			const majorName = item.major?.majorName || 'Unknown Major';

			if (!result[semesterName]) {
				result[semesterName] = {};
			}

			// Chỉ thêm phần tử đầu tiên nếu nhóm chưa tồn tại
			if (!result[semesterName][majorName]) {
				result[semesterName][majorName] = item;
			}

			return result;
		}, {});

		// Chuyển cấu trúc thành mảng
		return Object.values(grouped)
			.flatMap((majorMap) => Object.values(majorMap));
	}




	async getById(id: string): Promise<Subject_Course_Opening | null> {
		return this.subject_course_openingRepository.findOne({
			where: { id },
			relations: [
				'subject',
				'semester',
				'major'
			]
		});
	}

	// async saveMulti(data: any | any[]): Promise<Subject_Course_Opening[]> {
	// 	const recordsToSave: Subject_Course_Opening[] = [];
	// 	const subjectsMap = new Map<string, any>();
	// 	const semestersMap = new Map<string, any>();
	// 	const majorsMap = new Map<string, any>();

	// 	try {
	// 		const dataArray = Array.isArray(data) ? data : [data];

	// 		// Lấy danh sách các ID duy nhất để truy vấn trước
	// 		const subjectIds = [...new Set(dataArray.map((item) => item.subjectId))];
	// 		const semesterIds = [...new Set(dataArray.map((item) => item.semester))];
	// 		const majorIds = [...new Set(dataArray.map((item) => item.major))];

	// 		// Truy vấn trước các dữ liệu cần thiết
	// 		const subjects = await this.subjectRepository.findBy({ subjectId: In(subjectIds) });
	// 		const semesters = await this.semesterRepository.findBy({ semesterId: In(semesterIds) });
	// 		const majors = await this.majorRepository.findBy({ majorId: In(majorIds) });

	// 		// Tạo map để tra cứu nhanh
	// 		subjects.forEach((subject) => subjectsMap.set(subject.subjectId, subject));
	// 		semesters.forEach((semester) => semestersMap.set(semester.semesterId, semester));
	// 		majors.forEach((major) => majorsMap.set(major.majorId, major));

	// 		// Sử dụng transaction để đảm bảo toàn vẹn dữ liệu
	// 		await this.subject_course_openingRepository.manager.transaction(async (transactionalEntityManager) => {
	// 			for (const record of dataArray) {
	// 				// Kiểm tra và xử lý Subject
	// 				let subject = subjectsMap.get(record.subjectId);
	// 				if (!subject) {
	// 					if (!record.subjectName || !record.creditHour) {
	// 						throw new Error(`Subject details (name and creditHour) are required for subjectId: ${record.subjectId}`);
	// 					}

	// 					// Thử tìm bản ghi trong CSDL trước khi tạo mới
	// 					subject = await transactionalEntityManager.findOne(this.subjectRepository.target, {
	// 						where: { subjectId: record.subjectId },
	// 					});

	// 					if (!subject) {
	// 						// Tạo mới nếu không tồn tại
	// 						subject = this.subjectRepository.create({
	// 							subjectId: record.subjectId,
	// 							subjectName: record.subjectName,
	// 							creditHour: record.creditHour,
	// 						});
	// 						await transactionalEntityManager.save(subject);
	// 					}
	// 					subjectsMap.set(record.subjectId, subject);
	// 				}

	// 				// Kiểm tra Semester
	// 				const semester = semestersMap.get(record.semester);
	// 				if (!semester) {
	// 					throw new Error(`Invalid semester ID: ${record.semester}`);
	// 				}

	// 				// Kiểm tra Major
	// 				const major = majorsMap.get(record.major);
	// 				if (!major) {
	// 					throw new Error(`Invalid major ID: ${record.major}`);
	// 				}

	// 				// Xử lý instructors
	// 				const instructors = Array.isArray(record.instructors) ? record.instructors : [];

	// 				// Tìm xem bản ghi đã tồn tại chưa
	// 				const existingRecord = await this.subject_course_openingRepository.findOne({
	// 					where: {
	// 						subject: { subjectId: record.subjectId },
	// 						semester: { semesterId: record.semester },
	// 						major: { majorId: record.major },
	// 					},
	// 				});

	// 				if (existingRecord) {
	// 					// Cập nhật nếu đã tồn tại
	// 					this.subject_course_openingRepository.merge(existingRecord, {
	// 						openGroup: record.openGroup || existingRecord.openGroup,
	// 						studentsPerGroup: record.studentsPerGroup || existingRecord.studentsPerGroup,
	// 						instructors: instructors.length > 0 ? instructors : existingRecord.instructors,
	// 						disabled: record.disabled !== undefined ? record.disabled : existingRecord.disabled,
	// 					});
	// 					recordsToSave.push(existingRecord);
	// 				} else {
	// 					// Tạo mới nếu không tồn tại
	// 					const newRecord = this.subject_course_openingRepository.create({
	// 						subject,
	// 						semester,
	// 						major,
	// 						openGroup: record.openGroup || 0,
	// 						studentsPerGroup: record.studentsPerGroup || 0,
	// 						instructors,
	// 						disabled: record.disabled || false,
	// 					});
	// 					recordsToSave.push(newRecord);
	// 				}
	// 			}

	// 			// Lưu tất cả các bản ghi trong transaction
	// 			await transactionalEntityManager.save(recordsToSave);
	// 		});

	// 		return recordsToSave;
	// 	} catch (error) {
	// 		console.error('Error in saveMulti:', error);
	// 		throw new Error('Failed to save subject course openings');
	// 	}
	// }

	async saveMulti(data: any | any[]): Promise<Subject_Course_Opening[]> {
		const recordsToSave: Subject_Course_Opening[] = [];
		const subjectsMap = new Map<string, any>();
		const semestersMap = new Map<string, any>();
		const majorsMap = new Map<string, any>();

		try {
			const dataArray = Array.isArray(data) ? data : [data];

			// Lấy danh sách các ID duy nhất
			const subjectIds = [...new Set(dataArray.map((item) => item.subjectId))];
			const semesterIds = [...new Set(dataArray.map((item) => item.semester))];
			const majorIds = [...new Set(dataArray.map((item) => item.major))];

			// Parallelize các truy vấn
			const [subjects, semesters, majors] = await Promise.all([
				this.subjectRepository.findBy({ subjectId: In(subjectIds) }),
				this.semesterRepository.findBy({ semesterId: In(semesterIds) }),
				this.majorRepository.findBy({ majorId: In(majorIds) }),
			]);

			// Tạo Map để tra cứu nhanh
			subjects.forEach((subject) => subjectsMap.set(subject.subjectId, subject));
			semesters.forEach((semester) => semestersMap.set(semester.semesterId, semester));
			majors.forEach((major) => majorsMap.set(major.majorId, major));

			// Lấy các bản ghi Subject_Course_Opening hiện tại để giảm truy vấn trong vòng lặp
			const existingRecords = await this.subject_course_openingRepository.find({
				where: dataArray.map((record) => ({
					subject: { subjectId: record.subjectId },
					semester: { semesterId: record.semester },
					major: { majorId: record.major },
				})),
				relations: ['subject', 'semester', 'major']
			});

			// Tạo Map từ các bản ghi hiện tại
			const existingRecordsMap = new Map(
				existingRecords.map((record) => [
					`${record.subject.subjectId}-${record.semester.semesterId}-${record.major.majorId}`,
					record
				])
			);

			// Transaction
			await this.subject_course_openingRepository.manager.transaction(async (transactionalEntityManager) => {
				for (const record of dataArray) {
					// Kiểm tra và xử lý Subject
					let subject = subjectsMap.get(record.subjectId);
					if (!subject) {
						// Nếu subject chưa tồn tại trong subjectsMap, kiểm tra trong cơ sở dữ liệu
						if (!record.subjectName || !record.creditHour) {
							throw new Error(`Subject details (name and creditHour) are required for subjectId: ${record.subjectId}`);
						}

						// Kiểm tra xem subject đã tồn tại trong cơ sở dữ liệu
						subject = await this.subjectRepository.findOneBy({ subjectId: record.subjectId });

						if (!subject) {
							// Nếu subject chưa tồn tại, tạo mới subject
							subject = this.subjectRepository.create({
								subjectId: record.subjectId,
								subjectName: record.subjectName,
								creditHour: record.creditHour,
							});

							// Lưu subject vào cơ sở dữ liệu
							await transactionalEntityManager.save(subject);
						}

						// Thêm vào subjectsMap để sử dụng sau
						subjectsMap.set(record.subjectId, subject);
					}

					// Kiểm tra Semester và Major
					const semester = semestersMap.get(record.semester);
					if (!semester) {
						throw new Error(`Invalid semester ID: ${record.semester}`);
					}

					const major = majorsMap.get(record.major);
					if (!major) {
						throw new Error(`Invalid major ID: ${record.major}`);
					}

					// Xử lý instructors
					const instructors = Array.isArray(record.instructors) ? record.instructors : [];

					// Kiểm tra xem bản ghi đã tồn tại chưa
					const key = `${record.subjectId}-${record.semester}-${record.major}`;
					const existingRecord = existingRecordsMap.get(key);

					if (existingRecord) {
						// Cập nhật nếu đã tồn tại
						this.subject_course_openingRepository.merge(existingRecord, {
							openGroup: record.openGroup || existingRecord.openGroup,
							studentsPerGroup: record.studentsPerGroup || existingRecord.studentsPerGroup,
							instructors: instructors.length > 0 ? instructors : existingRecord.instructors,
							disabled: record.disabled !== undefined ? record.disabled : existingRecord.disabled,
						});
						recordsToSave.push(existingRecord);
					} else {
						// Tạo mới nếu không tồn tại
						const newRecord = this.subject_course_openingRepository.create({
							subject,
							semester,
							major,
							openGroup: record.openGroup || 0,
							studentsPerGroup: record.studentsPerGroup || 0,
							instructors,
							disabled: record.disabled || false,
						});
						recordsToSave.push(newRecord);
					}
				}

				// Lưu tất cả các bản ghi trong transaction
				await transactionalEntityManager.save(recordsToSave);
			});

			return recordsToSave;
		} catch (error) {
			console.error('Error in saveMulti:', error);
			throw new Error('Failed to save subject course openings');
		}
	}



	async delete(ids: string[]): Promise<boolean> {
		const result = await this.subject_course_openingRepository.delete({ id: In(ids) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}

	async getWhere(condition: any): Promise<Subject_Course_Opening[]> {
		const whereCondition: any = {};

		if (condition.subject) {
			whereCondition.subject = { subjectId: condition.subject }
		}

		if (condition.semester) {
			whereCondition.semester = { semesterId: condition.semester };
		}

		if (condition.major) {
			whereCondition.major = { majorId: condition.major };
		}


		return this.subject_course_openingRepository.find({
			where: whereCondition,
			order: { createDate: "ASC" },
			relations: [
				'subject',
				'semester',
				'major'
			],
		});
	}


	// Hàm xóa dữ liệu theo semester và major
	async deleteBySemesterAndMajor(semesterId: string, majorId: string): Promise<void> {
		// Tìm các khóa học theo semesterId và majorId
		const courseOpeningsToDelete = await this.subject_course_openingRepository.find({
			where: {
				semester: { semesterId: semesterId },
				major: { majorId: majorId }
			}
		});

		// Nếu có dữ liệu tìm thấy, xóa
		if (courseOpeningsToDelete.length > 0) {
			await this.subject_course_openingRepository.remove(courseOpeningsToDelete);
			console.log(`Deleted ${courseOpeningsToDelete.length} course openings for semesterId: ${semesterId} and majorId: ${majorId}`);
		} else {
			console.log('No course openings found to delete.');
		}
	}

	// Lấy danh sách mở học phần của các học kỳ theo học phần
	async getGroupedBySubjectForSemesters(major: string, semesterIds: string[]): Promise<Record<string, any>> {
		try {
			// Truy vấn các Subject_Course_Opening liên quan đến danh sách semesterIds
			const courseOpenings = await this.subject_course_openingRepository.find({
				where: {
					major: { majorId: major },
					semester: { semesterId: In(semesterIds) },
				},
				relations: ['subject', 'semester', 'major'],
				order: { createDate: 'ASC' },
			});

			// Nhóm theo subjectId và semesterId
			const groupedBySubjectAndSemester = courseOpenings.reduce((result: Record<string, any>, course) => {
				const key = `${course.subject.subjectId}_${course.semester.semesterId}`; // Tạo key từ subjectId và semesterId

				// Nếu chưa có nhóm cho key, khởi tạo nhóm
				if (!result[key]) {
					result[key] = {
						openGroup: course.openGroup,
						studentsPerGroup: course.studentsPerGroup,
						instructors: course.instructors,
						disabled: course.disabled,
					};
				}

				return result;
			}, {});

			return groupedBySubjectAndSemester;
		} catch (error) {
			console.error('Error in getGroupedBySubjectForSemesters:', error);
			throw new Error('Failed to fetch and group course openings by subject and semester');
		}
	}



}

