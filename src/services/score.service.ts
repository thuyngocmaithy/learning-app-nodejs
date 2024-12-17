import { Repository, DataSource, FindOneOptions, In, getRepository } from 'typeorm';
import { Score } from '../entities/Score';
import { Semester } from '../entities/Semester';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { Cycle } from '../entities/Cycle';
import { Subject_Course_Opening } from '../entities/Subject_Course_Opening';
import { UserRegisterSubject } from '../entities/User_Register_Subject';

export class ScoreService {
	private scoreRepository: Repository<Score>;
	private semesterRepository: Repository<Semester>;
	private subjectRepository: Repository<Subject>;
	private userRepository: Repository<User>;
	private cycleRepository: Repository<Cycle>;
	private dataSource: DataSource;


	constructor(dataSource: DataSource) {
		this.scoreRepository = dataSource.getRepository(Score);
		this.subjectRepository = dataSource.getRepository(Subject);
		this.semesterRepository = dataSource.getRepository(Semester);
		this.userRepository = dataSource.getRepository(User);
		this.cycleRepository = dataSource.getRepository(Cycle);
		this.dataSource = dataSource;
	}

	public getAll = async (): Promise<Score[]> => {
		return this.scoreRepository.find({
			relations: ['subject', 'student', 'semester'],
		});
	};

	public getById = async (id: string): Promise<Score | null> => {
		const options: FindOneOptions<Score> = {
			where: { id },
			relations: ['subject', 'student', 'semester'],
		};
		return this.scoreRepository.findOne(options);
	};

	public create = async (scoreData: Partial<Score>): Promise<Score> => {
		const score = this.scoreRepository.create(scoreData);
		return this.scoreRepository.save(score);
	};

	public update = async (id: string, scoreData: Partial<Score>): Promise<Score | null> => {
		await this.scoreRepository.update(id, scoreData);
		const options: FindOneOptions<Score> = {
			where: { id },
			relations: ['subject', 'student', 'semester'],
		};
		return this.scoreRepository.findOne(options);
	};

	public delete = async (ids: string[]): Promise<boolean> => {
		const result = await this.scoreRepository.delete({ id: In(ids) });
		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	};

	public getScoreByStudentId = async (studentId: string): Promise<Score[]> => {
		const scores = await this.scoreRepository.find({
			where: { student: { userId: studentId } },
			relations: ['subject', 'semester'],
		});

		const uniqueScores = scores.filter((score, index, self) =>
			index === self.findIndex((s) => (
				s.subject.subjectId === score.subject.subjectId &&
				s.semester.semesterId === score.semester.semesterId
			))
		);

		return uniqueScores;
	};

	public getScoreByStudentIdAndSemesterId = async (
		studentId: string,
		semesterId: string
	): Promise<Score[]> => {
		return this.scoreRepository.find({
			where: { student: { userId: studentId }, semester: { semesterId: semesterId } },
			relations: ['subject', 'student', 'semester'],
		});
	};

	public getScoreByStudentIdAndSubjectId = async (
		studentId: string,
		subjectId: string
	): Promise<Score | null> => {
		return this.scoreRepository.findOne({
			where: { student: { userId: studentId }, subject: { subjectId: subjectId } },
			relations: ['subject', 'student', 'semester'],
		});
	};

	async getUserScore(): Promise<any> {
		try {
			const query = 'CALL getUserScore()';
			return await this.dataSource.query(query);
		} catch (error) {
			console.error('Lỗi khi gọi stored procedure getUserScore', error);
			throw new Error('Lỗi khi gọi stored procedure');
		}
	}

	//import score
	async importScoresForUserFromSgu(scores: Partial<Score>[]): Promise<void> {
		try {
			const userId = scores[0]?.student?.userId;
			if (!userId) return;

			const user = await this.userRepository.findOneBy({ userId });
			if (!user) return;

			const cycle = await this.cycleRepository.findOneBy({
				startYear: user.firstAcademicYear,
				endYear: user.lastAcademicYear,
			});
			if (!cycle) return;

			// Tập hợp dữ liệu cần thiết trước (semester, subject)
			const semesterIds = [...new Set(scores.map(s => s.semester?.semesterId).filter(Boolean))];
			const subjectIds = [...new Set(scores.map(s => s.subject?.subjectId).filter(Boolean))];

			const existingSemesters = await this.semesterRepository.findBy({ semesterId: In(semesterIds) });
			const existingSubjects = await this.subjectRepository.findBy({ subjectId: In(subjectIds) });

			const semesterMap = new Map(existingSemesters.map(s => [s.semesterId, s]));
			const subjectMap = new Map(existingSubjects.map(s => [s.subjectId, s]));

			const scoresToSave: Score[] = [];
			const newSemesters: Semester[] = [];
			const newSubjects: Subject[] = [];

			for (const score of scores) {
				if (!score.subject || !score.student || !score.semester) continue;

				// Tìm hoặc tạo học kỳ
				let semester = semesterMap.get(score.semester.semesterId);
				if (!semester) {
					semester = new Semester();
					semester.semesterId = score.semester.semesterId;
					semester.semesterName = parseInt(score.semester.semesterId.substring(4)) || 0;
					semester.academicYear = parseInt(score.semester.semesterId.substring(0, 4)) || 0;

					// Thêm chu kỳ vào mảng cycles
					semester.cycles = [cycle];
					newSemesters.push(semester);
					semesterMap.set(semester.semesterId, semester);
				} else {
					// Nếu học kỳ đã tồn tại, thêm chu kỳ vào mảng cycles (nếu chưa tồn tại)
					if (!semester.cycles.some(c => c.cycleId === cycle.cycleId)) {
						semester.cycles.push(cycle);
					}
				}


				// Tìm hoặc tạo môn học
				let subject = subjectMap.get(score.subject.subjectId.toString());
				if (!subject) {
					subject = this.subjectRepository.create({
						...score.subject,
						createDate: new Date(),
						lastModifyDate: new Date(),
						createUser: user,
						lastModifyUser: user,
					});
					newSubjects.push(subject);
					subjectMap.set(subject.subjectId, subject);
				}

				// Kiểm tra xem điểm đã tồn tại hay chưa
				const existingScore = await this.scoreRepository.findOne({
					where: {
						student: user,
						subject: { subjectId: subject.subjectId },
						semester: { semesterId: semester.semesterId },
						finalScore10: score.finalScore10,
					},
				});

				if (!existingScore) {
					const scoreSave = this.scoreRepository.create({
						...score,
						student: user,
						subject: subject,
						semester: semester,
					});
					scoresToSave.push(scoreSave);
				}
			}

			// Batch insert/update
			if (newSemesters.length > 0) {
				await this.semesterRepository.save(newSemesters);
			}
			if (newSubjects.length > 0) {
				await this.subjectRepository.save(newSubjects);
			}
			if (scoresToSave.length > 0) {
				await this.scoreRepository.save(scoresToSave);
			}
		} catch (error) {
			console.error('Lỗi khi lưu điểm của người dùng:', error);
		}
	}


}