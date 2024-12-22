// studyFrame.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { FrameStructure } from '../entities/FrameStructure';
import { Specialization } from '../entities/Specialization';

export class StudyFrame_ComponentService {
	private studyFrameCompRepository: Repository<StudyFrame_Component>;
	private frameStructureRepository: Repository<FrameStructure>;
	private specializationRepository: Repository<Specialization>;

	constructor(dataSource: DataSource) {
		this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
		this.frameStructureRepository = dataSource.getRepository(FrameStructure);
		this.specializationRepository = dataSource.getRepository(Specialization);
	}

	async create(data: any): Promise<StudyFrame_Component> {
		let specialization;
		if (data.specializationId) {
			specialization = await this.specializationRepository.findOne({ where: { specializationId: data.specializationId } });
			if (!specialization) {
				throw new Error('Invalid specialization ID');
			}
		}
		else {
			specialization = undefined;
		}
		const studyFrame_component = this.studyFrameCompRepository.create({
			frameComponentId: data.frameComponentId,
			frameComponentName: data.frameComponentName,
			description: data.description,
			creditHour: data.creditHour,
			specialization: specialization
		});

		const savedStudyFrame = await this.studyFrameCompRepository.save(studyFrame_component);
		return savedStudyFrame;
	}

	async getAll(): Promise<StudyFrame_Component[]> {
		return this.studyFrameCompRepository.find({ relations: ["specialization"] });
	}

	async getById(id: string): Promise<StudyFrame_Component | null> {
		return this.studyFrameCompRepository.findOne({
			where: { id: id },
			relations: [
				'specialization'
			],
		});
	}

	async update(id: string, data: any): Promise<StudyFrame_Component | null> {
		const studyFrameComp = await this.studyFrameCompRepository.findOne({ where: { frameComponentId: id } });
		if (!studyFrameComp) {
			return null;
		}


		if (data.specializationId) {
			var specialization = await this.specializationRepository.findOne({ where: { specializationId: data.specializationId } });
			if (!specialization) {
				throw new Error('Invalid specialization ID');
			}
			data.specialization = specialization;
		}
		else {
			data.specialization = null;
		}

		// Tìm khung thành phần cha để Update số tín chỉ
		// Lấy entity frameStructure theo studyFrameComponent => dựa vào entity này để lấy studyFrameComponentParent
		const frameStructure = await this.frameStructureRepository.find({
			where: { studyFrameComponent: { frameComponentId: studyFrameComp.frameComponentId } },
			relations: ["studyFrameComponentParent"]
		})
		frameStructure.forEach(async (itemFrameStructure) => {
			// Nếu có studyFrameComponentParent
			if (itemFrameStructure?.studyFrameComponentParent?.frameComponentId) {
				// Dựa vào studyFrameComponentParent trên tìm ra danh sách các component theo studyFrameComponentParent
				const listFrameStructure = await this.frameStructureRepository.find({
					where: { studyFrameComponentParent: { frameComponentId: itemFrameStructure?.studyFrameComponentParent?.frameComponentId } },
					relations: ["studyFrameComponent"]
				})
				if (listFrameStructure) {
					const { totalMin, totalMax } = listFrameStructure.reduce(
						(accumulator, item) => {
							const creditHour = item.studyFrameComponent?.creditHour;
							const minCreditHour = creditHour ? Number(creditHour.split("/")[0]) : 0;
							const maxCreditHour = creditHour ? Number(creditHour.split("/")[1]) : 0;
							return {
								totalMin: accumulator.totalMin + minCreditHour,
								totalMax: accumulator.totalMax + maxCreditHour,
							};
						},
						{ totalMin: 0, totalMax: 0 } // Giá trị khởi tạo cho tổng min và max
					);

					const creditHourUpdate = `${totalMin}/${totalMax}`;
					// Tìm entity studyFrameComponent
					const studyFrameComponentParentUpdate = await this.studyFrameCompRepository.findOne({
						where: { frameComponentId: itemFrameStructure.studyFrameComponentParent.frameComponentId }
					})
					if (studyFrameComponentParentUpdate) {
						// Update creditHour
						studyFrameComponentParentUpdate.creditHour = creditHourUpdate;
						// Lưu lại thay đổi vào database
						await this.studyFrameCompRepository.save(studyFrameComponentParentUpdate);
					}

				}
			}
		})


		this.studyFrameCompRepository.merge(studyFrameComp, data);
		return this.studyFrameCompRepository.save(studyFrameComp);
	}

	async checkRelatedData(ids: string[]): Promise<{ success: boolean; message?: string }> {
		const count = await this.frameStructureRepository.count({
			where: [
				{ studyFrameComponent: { frameComponentId: In(ids) } },
				{ studyFrameComponentParent: { frameComponentId: In(ids) } }
			],
		});


		if (count > 0) {
			return {
				success: false,
				message: `Khối kiến thức được sử dụng trong khung đào tạo. Không thể xóa.`,
			};
		}

		return { success: true };
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.studyFrameCompRepository.delete({ frameComponentId: In(ids) });
		return result.affected !== 0;
	}

	async getWhere(condition: any): Promise<StudyFrame_Component[]> {
		const whereCondition: any = {};

		if (condition.frameComponentId) {
			whereCondition.frameComponentId = Like(`%${condition.frameComponentId}%`);
		}
		if (condition.frameComponentName) {
			whereCondition.frameComponentName = Like(`%${condition.frameComponentName}%`);
		}
		if (condition.description) {
			whereCondition.description = Like(`%${condition.description}%`);
		}

		if (condition.specialization) {
			whereCondition.specialization = { specializationId: condition.specialization };
		}

		return this.studyFrameCompRepository.find({
			where: whereCondition,
			relations: [
				'specialization'
			],
		});
	}

}

