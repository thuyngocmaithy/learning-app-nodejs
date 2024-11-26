// studyFrame.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { StudyFrame_Component } from '../entities/StudyFrame';
import { Major } from '../entities/Major';
import { FrameStructure } from '../entities/FrameStructure';

export class StudyFrame_ComponentService {
  private studyFrameCompRepository: Repository<StudyFrame_Component>;
  private frameStructureRepository: Repository<FrameStructure>;
  private majorRepository: Repository<Major>;

  constructor(dataSource: DataSource) {
    this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
    this.frameStructureRepository = dataSource.getRepository(FrameStructure);
    this.majorRepository = dataSource.getRepository(Major);
  }

  async create(data: any): Promise<StudyFrame_Component> {
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
    const studyFrame_component = this.studyFrameCompRepository.create({
      frameComponentId: data.frameComponentId,
      frameComponentName: data.frameComponentName,
      description: data.description,
      creditHour: data.creditHour,
      major: major
    });

    const savedStudyFrame = await this.studyFrameCompRepository.save(studyFrame_component);
    return savedStudyFrame;
  }

  async getAll(): Promise<StudyFrame_Component[]> {
    return this.studyFrameCompRepository.find({ relations: ["major"] });
  }

  async getById(id: string): Promise<StudyFrame_Component | null> {
    return this.studyFrameCompRepository.findOne({ where: { id: id } });
  }

  async update(id: string, data: any): Promise<StudyFrame_Component | null> {
    const studyFrameComp = await this.studyFrameCompRepository.findOne({ where: { frameComponentId: id } });
    if (!studyFrameComp) {
      return null;
    }


    if (data.majorId) {
      var major = await this.majorRepository.findOne({ where: { majorId: data.majorId } });
      if (!major) {
        throw new Error('Invalid major ID');
      }
      data.major = major;
    }
    else {
      data.major = null;
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

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.studyFrameCompRepository.delete({ frameComponentId: In(ids) });
    return result.affected !== 0;
  }


}

