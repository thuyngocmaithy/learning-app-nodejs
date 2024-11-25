// major.service.ts
import { DataSource, In, Like, Repository } from 'typeorm';
import { Major } from '../entities/Major';
import { User } from '../entities/User';
import { Faculty } from '../entities/Faculty';

export class MajorService {
  private majorRepository: Repository<Major>;
  private userRepository: Repository<User>;
  private facultyRepository: Repository<Faculty>

  constructor(dataSource: DataSource) {
    this.majorRepository = dataSource.getRepository(Major);
    this.userRepository = dataSource.getRepository(User);
    this.facultyRepository = dataSource.getRepository(Faculty);
  }

  async getAll(): Promise<Major[]> {
    return this.majorRepository.find({
      relations: ['faculty'],
    });
  }
  async getById(majorId: string): Promise<Major | null> {
    return this.majorRepository.findOneBy({ majorId });
  }

  async getMaxOrderNoByFaculty(facultyId: string): Promise<number> {
    const result = await this.majorRepository
      .createQueryBuilder('major')
      .leftJoin('major.faculty', 'faculty')
      .where('faculty.facultyId = :facultyId', { facultyId })
      .select('MAX(major.orderNo)', 'maxOrderNo')
      .getRawOne();
    return result.maxOrderNo || 0;
  }


  async create(data: Partial<Major>): Promise<Major> {
    console.log(data);
    if (!data.faculty?.facultyId) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepository.findOneBy({
      facultyId: data.faculty.facultyId
    });

    if (!faculty) {
      throw new Error('Faculty not found');
    }

    const maxOrderNo = await this.getMaxOrderNoByFaculty(faculty.facultyId);

    const major = this.majorRepository.create({
      ...data,
      faculty: faculty,
      orderNo: maxOrderNo + 1
    });

    return this.majorRepository.save(major);
  }

  async update(majorId: string, data: Partial<Major>): Promise<Major | null> {
    const major = await this.majorRepository.findOneBy({ majorId });
    if (!major) {
      return null;
    }
    this.majorRepository.merge(major, data);
    return this.majorRepository.save(major);
  }

  async delete(majorIds: string[]): Promise<boolean> {
    const result = await this.majorRepository.delete({ majorId: In(majorIds) });
    return result.affected !== 0;
  }

  async getWhere(condition: any): Promise<Major[]> {
    const whereCondition: any = {};

    if (condition.userId) {
      const user = await this.userRepository.findOne({
        where: { userId: condition.userId },
        relations: ["faculty"]
      })
      if (!user) {
        throw new Error('Not found entity user');
      }
      whereCondition.faculty = { facultyId: user.faculty.facultyId }
    }

    if (condition.majorId) {
      whereCondition.majorId = Like(`%${condition.majorId}%`);
    }

    if (condition.majorName) {
      whereCondition.majorName = Like(`%${condition.majorName}%`); // Tìm kiếm tương đối
    }

    if (condition.facultyId) {
      whereCondition.faculty = { facultyId: condition.facultyId };
    }

    if (condition.facultyName) {
      whereCondition.faculty = { facultyName: condition.facultyName };
    }

    return this.majorRepository.find({
      where: whereCondition,
      relations: ['faculty']
    });
  }

  async importMajor(data: any[]) {
    const majorsToSave = await Promise.all(
      data.map(async (majorData) => {
        const majorId = majorData[0];
        const majorName = majorData[1];
        const facultyId = majorData[2];
  
        // Kiểm tra xem ngành học đã tồn tại chưa
        const existingMajor = await this.majorRepository.findOne({
          where: { majorId },
        });
  
        if (existingMajor) {
          // Nếu đã tồn tại, cập nhật thông tin ngành học
          existingMajor.majorName = majorName;
  
          // Tìm faculty dựa trên facultyId
          const faculty = await this.facultyRepository.findOne({
            where: { facultyId },
          });
  
          if (!faculty) {
            throw new Error(`Không tìm thấy khoa với mã: ${facultyId}`);
          }
  
          existingMajor.faculty = faculty;
  
          // Cập nhật orderNo
          const maxOrderNo = await this.getMaxOrderNoByFaculty(faculty.facultyId);
          existingMajor.orderNo = maxOrderNo + 1;
  
          return existingMajor;
        } else {
          // Nếu chưa tồn tại, tạo ngành học mới
          const major = new Major();
          major.majorId = majorId;
          major.majorName = majorName;
  
          // Tìm faculty dựa trên facultyId
          const faculty = await this.facultyRepository.findOne({
            where: { facultyId },
          });
  
          if (!faculty) {
            throw new Error(`Không tìm thấy khoa với mã: ${facultyId}`);
          }
  
          major.faculty = faculty;
  
          // Gán orderNo mới
          const maxOrderNo = await this.getMaxOrderNoByFaculty(faculty.facultyId);
          major.orderNo = maxOrderNo + 1;
  
          return major;
        }
      })
    );
  
    // Lưu danh sách majors vào database
    await this.majorRepository.save(majorsToSave);
  }


}