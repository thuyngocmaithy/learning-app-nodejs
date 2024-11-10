// ssm.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Subject_StudyFrameComp } from '../entities/Subject_StudyFrameComp';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { Subject } from '../entities/Subject';

export class Subject_StudyFrameCompService {
	private subject_studyFrameCompRepository: Repository<Subject_StudyFrameComp>;
	private studyFrameCompRepository: Repository<StudyFrame_Component>;
	private subjectRepository: Repository<Subject>;

	constructor(dataSource: DataSource) {
		this.subject_studyFrameCompRepository = dataSource.getRepository(Subject_StudyFrameComp);
		this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
		this.subjectRepository = dataSource.getRepository(Subject);
	}

	async create(data: Partial<Subject_StudyFrameComp>): Promise<Subject_StudyFrameComp> {
		const ssm = this.subject_studyFrameCompRepository.create(data);
		return this.subject_studyFrameCompRepository.save(ssm);
	}

	public createByListSubject = async (data: any): Promise<Subject_StudyFrameComp[]> => {
		const studyFrameComponent = await this.studyFrameCompRepository.findOne({ where: { frameComponentId: data.studyFrameComponentId } });
		if (!studyFrameComponent) {
			throw new Error('Invalid studyFrameComponent ID');
		}

		const savedSSMList: Subject_StudyFrameComp[] = [];

		for (const item of data.listSubject) {
			const subject = await this.subjectRepository.findOne({ where: { subjectId: item } });
			if (!subject) {
				throw new Error('Invalid subject ID');
			}

			const subject_studyFrameComp = this.subject_studyFrameCompRepository.create({
				subject: subject,
				studyFrameComponent: studyFrameComponent,
			});

			const savedSSM = await this.subject_studyFrameCompRepository.save(subject_studyFrameComp);
			savedSSMList.push(savedSSM);
		}

		return savedSSMList;
	}


	async getAll(): Promise<Subject_StudyFrameComp[]> {
		return this.subject_studyFrameCompRepository.find({
			relations: ['subject', 'studyFrameComponent']
		});
	}

	async getById(id: string): Promise<Subject_StudyFrameComp | null> {
		return this.subject_studyFrameCompRepository.findOne({ where: { id: id } });
	}

	async update(id: string, data: Partial<Subject_StudyFrameComp>): Promise<Subject_StudyFrameComp | null> {
		const ssm = await this.subject_studyFrameCompRepository.findOne({ where: { id: id } });
		if (!ssm) {
			return null;
		}
		this.subject_studyFrameCompRepository.merge(ssm, data);
		return this.subject_studyFrameCompRepository.save(ssm);
	}

	public updateByListSubject = async (data: any): Promise<boolean> => {
		// Tìm entity studyFrameComponent theo frameComponentId
		const studyFrameComponent = await this.studyFrameCompRepository.findOne({ where: { frameComponentId: data.studyFrameComponentId } });
		if (!studyFrameComponent) {
			throw new Error('Invalid studyFrameComponent ID');
		}

		// Lấy danh sách subject theo major và studyFrameComponent trong SSM
		const listSubjectDB = await this.subject_studyFrameCompRepository.find({
			where: {
				studyFrameComponent: studyFrameComponent
			},
			relations: ["subject"]
		})


		// Lặp qua danh sách môn học được chọn
		for (const item of data.listSubject) {
			// Tìm entity subject theo subjectId
			const subject = await this.subjectRepository.findOne({ where: { subjectId: item } });
			if (!subject) {
				throw new Error('Invalid subject ID');
			}
			if (listSubjectDB.some(dbItem => dbItem.subject.subjectId === item)) {
				// Trường hợp "db có, list có"
				// => Không thay đổi
			} else {
				// Trường hợp "db không có, list có"
				// Thêm vào db
				const subject_studyFrameComp = this.subject_studyFrameCompRepository.create({
					subject: subject,
					studyFrameComponent: studyFrameComponent,
				});
				// Thực hiện tạo mới SSM
				await this.subject_studyFrameCompRepository.save(subject_studyFrameComp);
			}
		}

		// Kiểm tra "db có, list không có" - các subject có trong db nhưng không có trong list
		// => Xóa khỏi db
		for (const dbItem of listSubjectDB) {
			if (!data.listSubject.includes(dbItem.subject.subjectId)) {
				// Thực hiện xóa SSM
				await this.subject_studyFrameCompRepository.delete({ id: dbItem.id });
			}
		}

		return true;
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.subject_studyFrameCompRepository.delete({ id: In(ids) });
		return result.affected !== 0;
	}

	async getWhere(condition: Partial<Subject_StudyFrameComp>): Promise<Subject_StudyFrameComp[]> {
		const whereCondition: any = {};

		if (condition.studyFrameComponent) {
			whereCondition.studyFrameComponent = { frameComponentId: condition.studyFrameComponent }
		}

		if (condition.subject) {
			whereCondition.subject = { subjectId: condition.subject }
		}

		return this.subject_studyFrameCompRepository.find({
			where: whereCondition,
			relations: ['studyFrameComponent', 'subject', 'subject.subjectBefore']
		});
	}
}
