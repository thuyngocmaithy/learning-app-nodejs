import { DataSource, In, Repository } from 'typeorm';
import { StudyFrame_Faculty_Cycle } from '../entities/StudyFrame_Faculty_Cycle';
import { StudyFrame, StudyFrame_Component } from '../entities/StudyFrame';
import { Subject } from '../entities/Subject';
import { Faculty } from '../entities/Faculty';
import { Cycle } from '../entities/Cycle';

export class StudyFrame_Faculty_CycleService {
	private studyFrame_Faculty_CycleRepository: Repository<StudyFrame_Faculty_Cycle>;
	private studyFrameRepository: Repository<StudyFrame>;
	private facultyRepository: Repository<Faculty>;
	private cycleRepository: Repository<Cycle>;


	constructor(dataSource: DataSource) {
		this.studyFrame_Faculty_CycleRepository = dataSource.getRepository(StudyFrame_Faculty_Cycle);
		this.studyFrameRepository = dataSource.getRepository(StudyFrame);
		this.facultyRepository = dataSource.getRepository(Faculty);
		this.cycleRepository = dataSource.getRepository(Cycle);

	}

	async create(data: Partial<StudyFrame_Faculty_Cycle>): Promise<StudyFrame_Faculty_Cycle> {
		const ssm = this.studyFrame_Faculty_CycleRepository.create(data);
		return this.studyFrame_Faculty_CycleRepository.save(ssm);
	}

	async getAll(): Promise<StudyFrame_Faculty_Cycle[]> {
		return this.studyFrame_Faculty_CycleRepository.find({
			relations: ['studyFrame', 'faculty', 'cycle']
		});
	}

	async getById(id: string): Promise<StudyFrame_Faculty_Cycle | null> {
		return this.studyFrame_Faculty_CycleRepository.findOne({ where: { id: id } });
	}

	async update(id: string, data: Partial<StudyFrame_Faculty_Cycle>): Promise<StudyFrame_Faculty_Cycle | null> {
		const ssm = await this.studyFrame_Faculty_CycleRepository.findOne({ where: { id: id } });
		if (!ssm) {
			return null;
		}
		this.studyFrame_Faculty_CycleRepository.merge(ssm, data);
		return this.studyFrame_Faculty_CycleRepository.save(ssm);
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.studyFrame_Faculty_CycleRepository.delete({ id: In(ids) });
		return result.affected !== 0;
	}

	async getWhere(condition: Partial<StudyFrame_Faculty_Cycle>): Promise<StudyFrame_Faculty_Cycle[]> {
		const whereCondition: any = {};

		if (condition.studyFrame) {
			whereCondition.studyFrame = { frameId: condition.studyFrame }
		}

		return this.studyFrame_Faculty_CycleRepository.find({
			where: whereCondition,
			relations: ['studyFrame', 'faculty', 'cycle']
		});
	}

	async saveApplyFrame(data: any[]) {
		try {
			// Lấy danh sách các item hiện có trong db
			const existingItems = await this.studyFrame_Faculty_CycleRepository.find({
				where: { studyFrame: { frameId: data[0].studyFrame } }, // tất cả item trong cùng một studyFrame
			});

			// Lấy các ID của các item từ `data`
			const newIds = data.map((item) => item.id);

			// Tìm các item trong db nhưng không còn tồn tại trong `treeData`
			const itemsToDelete = existingItems.filter((item) => !newIds.includes(item.id));

			// Xóa các item không còn trong `treeData`
			if (itemsToDelete.length > 0) {
				await this.studyFrame_Faculty_CycleRepository.remove(itemsToDelete);
				console.log(`Đã xóa ${itemsToDelete.length} phần tử không còn tồn tại.`);
			}

			await Promise.all(
				data.map(async (item) => {
					// Tìm đối tượng studyFrame
					const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: item.studyFrame } });
					if (!studyFrame) {
						throw new Error(`Không tìm thấy đối tượng studyFrame: ${item.studyFrame}`);
					}

					// Tìm đối tượng faculty
					const faculty = await this.facultyRepository.findOne({ where: { facultyId: item.faculty } });
					if (!faculty) {
						throw new Error(`Không tìm thấy đối tượng faculty: ${item.faculty}`);
					}

					// Tìm đối tượng cycle
					const cycle = await this.cycleRepository.findOne({ where: { cycleId: item.cycle } });
					if (!cycle) {
						throw new Error(`Không tìm thấy đối tượng cycle: ${item.cycle}`);
					}

					// Lưu phần tử
					const sfcSave = {
						id: item.id,
						studyFrame,
						faculty,
						cycle
					};

					await this.studyFrame_Faculty_CycleRepository.save(sfcSave);
				})
			);

			return { success: true, message: 'Lưu thành công' };
		} catch (error) {
			console.error('Lưu thất bại', error);
			throw new Error('Lưu thất bại');
		}
	}
}
