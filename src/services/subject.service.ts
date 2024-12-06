// src/services/subject.service.ts
import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Subject } from '../entities/Subject';
import { Subject_StudyFrameComp } from '../entities/Subject_StudyFrameComp';
import { User } from '../entities/User';

export class SubjectService {
	private subjectRepository: Repository<Subject>;
	private userRepository: Repository<User>;
	private dataSource: DataSource;


	constructor(dataSource: DataSource) {
		this.subjectRepository = dataSource.getRepository(Subject);
		this.userRepository = dataSource.getRepository(User);
		this.dataSource = dataSource;
	}

	async create(data: Partial<Subject> & { frameComponentName?: string, majorId?: string }): Promise<Subject> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {

			const subject = this.subjectRepository.create(data);
			const savedSubject = await queryRunner.manager.save(Subject, subject);

			await queryRunner.commitTransaction();
			return savedSubject;

		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async delete(subjectIds: string[]): Promise<boolean> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			await queryRunner.manager.delete(Subject_StudyFrameComp, {
				subject: { subjectId: In(subjectIds) }
			});

			const result = await queryRunner.manager.delete(Subject, {
				subjectId: In(subjectIds)
			});

			await queryRunner.commitTransaction();
			return result.affected !== 0;

		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async getAll(): Promise<Subject[]> {
		return this.subjectRepository.find({
			order: { createDate: 'DESC' },
			relations: ['subjectBefore']
		});
	}

	async getById(subjectId: string): Promise<Subject | null> {
		const options: FindOneOptions<Subject> = { where: { subjectId }, relations: ['subjectBefore'] };
		return await this.subjectRepository.findOne(options);
	}

	async update(subjectId: string, data: Partial<Subject> & { frameComponentName?: string, majorId?: string }): Promise<Subject | null> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Update the subject
			const subject = await this.subjectRepository.findOne({ where: { subjectId } });
			if (!subject) return null;

			this.subjectRepository.merge(subject, data);
			const updatedSubject = await queryRunner.manager.save(Subject, subject);

			await queryRunner.commitTransaction();
			return updatedSubject;

		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}



	async getSubjectByFacultyId(facultyId: string): Promise<Subject[]> {
		try {
			const subjects = await this.dataSource.query('CALL GetSubjectsByFaculty(?)', [facultyId]);
			return subjects; // Adapt based on how the result is returned
		} catch (error) {
			console.error('Error fetching subjects by faculty ID:', error);
			throw new Error('Unable to fetch subjects. Please try again later.'); // Optionally, you can throw a custom error
		}
	}

	async getAllSubjectDetail(): Promise<Subject[]> {
		try {
			const subjects = await this.dataSource.query('CALL GetSubjectsWithDetails()');
			return subjects;
		}
		catch (error) {
			console.error('Error fetching subject Detail:', error);
			throw new Error('Unable to fetch subjects. Please try again later.'); // Optionally, you can throw a custom error
		}
	}
	async getWhere(condition: any): Promise<any[]> {
		const queryBuilder = this.dataSource.createQueryBuilder()
			.select([
				's.subjectId AS subjectId',
				's.subjectName as subjectName',
				's.creditHour as creditHour',
				'sb.subjectId AS subjectBefore',
				'se.subjectId AS subjectEqual',
				's.createDate as createDate',
				's.createUserId as createUserId',
				's.lastModifyDate as lastModifyDate',
				's.lastModifyUserId as lastModifyUserId',
			])
			.from(Subject, 's')
			.leftJoin('s.subjectBefore', 'sb')
			.leftJoin('s.subjectEqual', 'se')

		// Add conditions dynamically
		if (condition.subjectId) {
			queryBuilder.andWhere('s.subjectId LIKE :subjectId', { subjectId: `%${condition.subjectId}%` });
		}

		if (condition.subjectName) {
			queryBuilder.andWhere('s.subjectName LIKE :subjectName', { subjectName: `%${condition.subjectName}%` });
		}

		if (condition.creditHour) {
			queryBuilder.andWhere('s.creditHour = :creditHour', { creditHour: condition.creditHour });
		}

		if (condition.subjectBeforeId) {
			queryBuilder.andWhere('sb.subjectId = :subjectBeforeId', { subjectBeforeId: condition.subjectBeforeId });
		}

		if (condition.frameComponentId) {
			queryBuilder.andWhere('sfc.frameComponentId = :frameComponentId', { frameComponentId: condition.frameComponentId });
		}

		queryBuilder.groupBy('s.subjectId'); // Đảm bảo mỗi môn học chỉ xuất hiện một lần
		queryBuilder.orderBy('s.createDate', 'DESC');
		// Execute the query
		return queryBuilder.getRawMany();
	}

	async importSubject(subjects: Partial<Subject>[], createUserId: string) {
		// Lưu từng môn học vào db
		let subjectSaved = [];
		for (const subject of subjects) {
			// Kiểm tra xem subjectId có giá trị hợp lệ hay không trước khi tạo môn học
			if (!subject.subjectId) {
				continue; // Bỏ qua nếu subjectId không có
			}
			// Kiểm tra và chuyển đổi môn học trước
			if (subject.subjectBefore) {
				const entity = await this.getById(subject.subjectBefore as unknown as string);
				if (entity) {
					subject.subjectBefore = entity;
				}
				else {
					subject.subjectBefore = null;
				}
			}

		}
	}
}
