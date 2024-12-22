// frameStructure.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { FrameStructure } from '../entities/FrameStructure';
import { StudyFrame, StudyFrame_Component } from '../entities/StudyFrame';

export class FrameStructureService {
  private frameStructureRepository: Repository<FrameStructure>;
  private studyFrameCompRepository: Repository<StudyFrame_Component>;
  private studyFrameRepository: Repository<StudyFrame>;

  constructor(dataSource: DataSource) {
    this.frameStructureRepository = dataSource.getRepository(FrameStructure);
    this.studyFrameCompRepository = dataSource.getRepository(StudyFrame_Component);
    this.studyFrameRepository = dataSource.getRepository(StudyFrame);
  }

  async create(data: Partial<FrameStructure>): Promise<FrameStructure> {
    const frameStructure = this.frameStructureRepository.create(data);
    return this.frameStructureRepository.save(frameStructure);
  }

  async getAll(): Promise<FrameStructure[]> {
    return this.frameStructureRepository.find({
      relations: ['studyFrame', 'studyFrameComponent', 'studyFrameComponentParent']
    });
  }

  async getById(id: string): Promise<FrameStructure | null> {
    return this.frameStructureRepository.findOne({ where: { id: id } });
  }

  async update(id: string, data: Partial<FrameStructure>): Promise<FrameStructure | null> {
    const frameStructure = await this.frameStructureRepository.findOne({ where: { id: id } });
    if (!frameStructure) {
      return null;
    }
    this.frameStructureRepository.merge(frameStructure, data);
    return this.frameStructureRepository.save(frameStructure);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.frameStructureRepository.delete({ studyFrame: { frameId: In(ids) } });
    return result.affected !== 0;
  }

  async getWhere(condition: Partial<FrameStructure>): Promise<FrameStructure[]> {
    const whereCondition: any = {};

    if (condition.studyFrame) {
      whereCondition.studyFrame = { frameId: condition.studyFrame }
    }

    if (condition.studyFrameComponent) {
      whereCondition.studyFrameComponent = { frameComponentId: condition.studyFrameComponent }
    }

    return this.frameStructureRepository.find({
      where: whereCondition,
      relations: ['studyFrame', 'studyFrameComponent', 'studyFrameComponent.specialization', 'studyFrameComponentParent']
    });
  }

  private flattenTreeData = (data: any[]) => {
    const result: any[] = [];

    const traverse = (nodes: any[], parentId: string | null) => {
      nodes.forEach(node => {
        // Thêm vào danh sách kết quả
        result.push({
          ...node,
          children: [] // Xóa thuộc tính children
        });

        // Nếu có các phần tử con, tiếp tục duyệt
        if (node.children && node.children.length > 0) {
          traverse(node.children, node.featureId);
        }
      });
    };

    traverse(data, null);
    return result;
  };

  async saveTreeData(treeData: any[]) {
    try {
      // Chuyển đổi cấu trúc cây thành danh sách phẳng
      const flattenedData = this.flattenTreeData(treeData);

      // Lấy danh sách các item hiện có trong db
      const existingItems = await this.frameStructureRepository.find({
        where: { studyFrame: { frameId: flattenedData[0]?.studyFrameId } }, // tất cả item trong cùng một studyFrame
      });

      if (!existingItems) return;

      // Lấy các ID của các item từ `flattenedData`
      const newIds = flattenedData.map((item) => item.key);

      // Tìm các item trong db nhưng không còn tồn tại trong `treeData`
      const itemsToDelete = existingItems.filter((item) => !newIds.includes(item.id));

      // Xóa các item không còn trong `treeData`
      if (itemsToDelete.length > 0) {
        await this.frameStructureRepository.remove(itemsToDelete);
        console.log(`Đã xóa ${itemsToDelete.length} phần tử không còn tồn tại.`);
      }

      // Tìm các entity từ id và tạo entityFrameStructure
      await Promise.all(
        flattenedData.map(async (item) => {
          // Nếu có studyFrameComponentParentId, tìm đối tượng cha từ studyFrameComponentParentId
          let studyFrameComponentParent = null;

          if (item.studyFrameComponentParentId) {
            studyFrameComponentParent = await this.studyFrameCompRepository.findOne({ where: { id: item.studyFrameComponentParentId } });
            if (!studyFrameComponentParent) {
              throw new Error(`Không tìm thấy đối tượng studyFrameComponentParent: ${item.studyFrameComponentParentId}`);
            }
          }

          // Tìm đối tượng studyFrame
          const studyFrame = await this.studyFrameRepository.findOne({ where: { frameId: item.studyFrameId } });
          if (!studyFrame) {
            throw new Error(`Không tìm thấy đối tượng studyFrame: ${item.studyFrameId}`);
          }

          // Tìm đối tượng studyFrameComponent
          const studyFrameComponent = await this.studyFrameCompRepository.findOne({ where: { id: item.studyFrameComponentId } });
          if (!studyFrameComponent) {
            throw new Error(`Không tìm thấy đối tượng studyFrameComponent: ${item.studyFrameComponentId}`);
          }

          // Lưu phần tử
          const frameStructureToSave = {
            id: item.key,
            studyFrame,
            studyFrameComponent,
            studyFrameComponentParent: studyFrameComponentParent || undefined,
            orderNo: item.orderNo,
          };

          await this.frameStructureRepository.save(frameStructureToSave); // Save individual item
        })
      );

      return { success: true, message: 'Cấu trúc khung đào tạo được lưu thành công' };
    } catch (error) {
      console.error('Cấu trúc khung đào tạo lưu thất bại', error);
      throw new Error('Cấu trúc khung đào tạo lưu thất bại');
    }
  }

}
