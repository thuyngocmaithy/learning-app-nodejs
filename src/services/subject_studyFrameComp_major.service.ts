// ssm.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Subject_StudyFrameComp_Major } from '../entities/Subject_StudyFrameComp_Major';
import { Major } from '../entities/Major';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { Subject } from '../entities/Subject';

export class Subject_StudyFrameComp_MajorService {
	private subject_studyFrameComp_majorRepository: Repository<Subject_StudyFrameComp_Major>;
	private majorRepository: Repository<Major>;
	private studyFrameCompRepository: Repository<StudyFrame_Component>;
	private subjectRepository: Repository<Subject>;

	constructor(dataSource: DataSource) {
		this.subject_studyFrameComp_majorRepository = dataSource.getRepository(Subject_StudyFrameComp_Major);
		this.majorRepository = dataSource.getRepository(Major);
		this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
		this.subjectRepository = dataSource.getRepository(Subject);
	}

	async create(data: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major> {
		const ssm = this.subject_studyFrameComp_majorRepository.create(data);
		return this.subject_studyFrameComp_majorRepository.save(ssm);
	}

	public createByListSubject = async (data: any): Promise<Subject_StudyFrameComp_Major[]> => {
		let major;
		if (data.majorId) {
			major = await this.majorRepository.findOne({ where: { majorId: data.majorId } });
			if (!major) {
				throw new Error('Invalid major ID');
			}
		}
		else {
			major = undefined;
		}


		const studyFrameComponent = await this.studyFrameCompRepository.findOne({ where: { frameComponentId: data.studyFrameComponentId } });
		if (!studyFrameComponent) {
			throw new Error('Invalid studyFrameComponent ID');
		}

		const savedSSMList: Subject_StudyFrameComp_Major[] = [];

		for (const item of data.listSubject) {
			const subject = await this.subjectRepository.findOne({ where: { subjectId: item } });
			if (!subject) {
				throw new Error('Invalid subject ID');
			}

			const subject_studyFrameComp_major = this.subject_studyFrameComp_majorRepository.create({
				subject: subject,
				major: major,
				studyFrameComponent: studyFrameComponent,
			});

			const savedSSM = await this.subject_studyFrameComp_majorRepository.save(subject_studyFrameComp_major);
			savedSSMList.push(savedSSM);
		}

		return savedSSMList;
	}


	async getAll(): Promise<Subject_StudyFrameComp_Major[]> {
		return this.subject_studyFrameComp_majorRepository.find({
			relations: ['subject', 'major', 'studyFrameComponent']
		});
	}

	async getById(id: string): Promise<Subject_StudyFrameComp_Major | null> {
		return this.subject_studyFrameComp_majorRepository.findOne({ where: { id: id } });
	}

	async update(id: string, data: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major | null> {
		const ssm = await this.subject_studyFrameComp_majorRepository.findOne({ where: { id: id } });
		if (!ssm) {
			return null;
		}
		this.subject_studyFrameComp_majorRepository.merge(ssm, data);
		return this.subject_studyFrameComp_majorRepository.save(ssm);
	}

	async updateByListSubject(id: string, data: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major | null> {
		const ssm = await this.subject_studyFrameComp_majorRepository.findOne({ where: { id: id } });
		if (!ssm) {
			return null;
		}

		// Lấy danh sách subject trong database theo major và studyFrameComponent
		const ssmDB = await this.subject_studyFrameComp_majorRepository.find({
			where: {
				id: id
			}
		});


		this.subject_studyFrameComp_majorRepository.merge(ssm, data);
		return this.subject_studyFrameComp_majorRepository.save(ssm);
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.subject_studyFrameComp_majorRepository.delete({ id: In(ids) });
		return result.affected !== 0;
	}

	async getWhere(condition: Partial<Subject_StudyFrameComp_Major>): Promise<Subject_StudyFrameComp_Major[]> {
		const whereCondition: any = {};

		if (condition.major) {
			whereCondition.major = { majorId: condition.major }
		}

		if (condition.studyFrameComponent) {
			whereCondition.studyFrameComponent = { frameComponentId: condition.studyFrameComponent }
		}

		if (condition.subject) {
			whereCondition.subject = { subjectId: condition.subject }
		}

		return this.subject_studyFrameComp_majorRepository.find({
			where: whereCondition,
			relations: ['major', 'studyFrameComponent', 'subject']
		});
	}
}
