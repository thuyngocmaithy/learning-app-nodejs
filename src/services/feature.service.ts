// feature.service.ts
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { Feature } from '../entities/Feature';
import { Permission } from '../entities/Permission';

export class FeatureService {
  private featureRepository: Repository<Feature>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.featureRepository = dataSource.getRepository(Feature);
    this.dataSource = dataSource;
  }

  async create(data: Partial<Feature>): Promise<Feature> {
    const feature = this.featureRepository.create(data);
    return this.featureRepository.save(feature);
  }

  async getAll(): Promise<Feature[]> {
    return this.featureRepository.find({ relations: ['parent'] });
  }

  async getById(featureId: string): Promise<Feature | null> {
    return this.featureRepository.findOne({ where: { featureId }, relations: ['parent'] });
  }

  async getWhere(condition: Partial<Feature>): Promise<Feature[]> {
    const queryBuilder = this.featureRepository.createQueryBuilder('feature');

    // Xử lý điều kiện `keyRoute`
    if (condition.keyRoute !== undefined) {
      if (condition.keyRoute === 'null') {
        // Sử dụng IS NULL cho giá trị null trong SQL
        queryBuilder.andWhere('feature.keyRoute IS NULL');
      } else {
        // Xử lý các giá trị keyRoute khác không phải null
        queryBuilder.andWhere('feature.keyRoute = :keyRoute', { keyRoute: condition.keyRoute });
      }
    }

    // Xử lý điều kiện `parent`
    if (condition.parent !== undefined) {
      if (condition.parent as unknown === 'null') {
        // Sử dụng IS NULL cho giá trị null trong SQL cho parent
        queryBuilder.andWhere('feature.parentFeatureId IS NULL');
      } else if (typeof condition.parent === 'object' && 'featureId' in condition.parent) {
        // Giả sử `condition.parent` là một đối tượng và bạn cần sử dụng `featureId` của nó
        const parentFeatureId = (condition.parent as Feature).featureId;
        queryBuilder.andWhere('feature.parentFeatureId = :parentFeatureId', { parentFeatureId });
      } else {
        // Xử lý các trường hợp không mong đợi
        console.error('Điều kiện parent không hợp lệ');
      }
    }


    // Thực thi truy vấn và trả về kết quả
    return queryBuilder.getMany();
  }

  async update(featureId: string, data: Partial<Feature>): Promise<Feature | null> {
    const feature = await this.featureRepository.findOne({ where: { featureId }, relations: ['parent'] });
    if (!feature) {
      return null;
    }
    this.featureRepository.merge(feature, data);
    return this.featureRepository.save(feature);
  }

  private readonly restrictedIds = ['FT012', 'FT013']; // Danh sách ID không được phép xóa

  async delete(featureId: string): Promise<boolean> {
    let result: DeleteResult = {
      affected: 0,
      raw: undefined
    };

    // Nếu không nằm trong danh sách ID bị cấm, thực hiện xóa
    if (!this.restrictedIds.includes(featureId)) {
      // Nếu không nằm trong danh sách ID bị cấm, thực hiện xóa
      result = await this.featureRepository.delete({ featureId });
    }
    return result.affected !== 0;
  }

  async generateNewId(): Promise<string> {
    const lastFeatures = await this.featureRepository.find({
      order: { featureId: 'DESC' },
      take: 1
    });

    let numericPart = 1;
    const prefix = 'FT';
    if (lastFeatures) {
      const lastfeature = lastFeatures[0];
      const lastNumericPart = parseInt(lastfeature.featureId.slice(prefix.length), 10);
      numericPart = lastNumericPart + 1;
    }
    return `${prefix}${numericPart.toString().padStart(3, '0')}`;
  }

  private flattenTreeData = (data: any[]) => {
    const result: any[] = [];

    const traverse = (nodes: any[], parentId: string | null) => {
      nodes.forEach(node => {
        // Thêm vào danh sách kết quả
        result.push({
          ...node,
          parentFeatureId: parentId, // Gán parentFeatureId cho phần tử
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

      // Lưu đối tượng cha và các phần tử con
      await Promise.all(
        flattenedData.map(async (item) => {
          // Nếu có parentFeatureId, tìm đối tượng cha từ parentFeatureId
          let parent = null;
          if (item.parentFeatureId) {
            parent = await this.featureRepository.findOne({ where: { featureId: item.parentFeatureId } });
            if (!parent) {
              throw new Error(`Không tìm thấy đối tượng cha với parentFeatureId: ${item.parentFeatureId}`);
            }
          }

          const featureToSave = {
            ...item,
            parent, // Gán đối tượng cha cho item
          };
          // Lưu phần tử (bao gồm đối tượng cha đã được gán)
          await this.featureRepository.save(featureToSave);
        })
      );

      return { success: true, message: 'Cấu trúc chức năng được lưu thành công' };
    } catch (error) {
      console.error('Cấu trúc chức năng lưu thất bại', error);
      throw new Error('Cấu trúc chức năng lưu thất bại');
    }
  }
}

