// faculty.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Faculty } from '../entities/Faculty';

export class FacultyService {
  private facultyRepository: Repository<Faculty>;

  constructor(dataSource: DataSource) {
    this.facultyRepository = dataSource.getRepository(Faculty);
  }

  async create(data: Partial<Faculty>): Promise<Faculty> {
    const faculty = this.facultyRepository.create(data);
    return this.facultyRepository.save(faculty);
  }

  async getAll(): Promise<Faculty[]> {
    return this.facultyRepository.find();
  }

  async getByFacultyId(facultyId: string): Promise<Faculty | null> {
    return this.facultyRepository.findOneBy({ facultyId });
  }

  async update(facultyId: string, data: Partial<Faculty>): Promise<Faculty | null> {
    const faculty = await this.facultyRepository.findOneBy({ facultyId });
    if (!faculty) {
      return null;
    }
    this.facultyRepository.merge(faculty, data);
    return this.facultyRepository.save(faculty);
  }

  async delete(facultyIds: string[]): Promise<boolean> {
    const result = await this.facultyRepository.delete({ facultyId: In(facultyIds) });
    return result.affected !== 0;
  }

  async getWhere(condition: Partial<Faculty>): Promise<Faculty[]> {
    const queryBuilder = this.facultyRepository.createQueryBuilder('faculty');
    
    if (condition.facultyId) {
        queryBuilder.andWhere('faculty.facultyId LIKE :facultyId', { 
            facultyId: `%${condition.facultyId}%` 
        });
    }
    
    if (condition.facultyName) {
        queryBuilder.andWhere('faculty.facultyName LIKE :facultyName', { 
            facultyName: `%${condition.facultyName}%` 
        });
    }
    
    return queryBuilder.getMany();
  }

  async importFaculty(data: any[]) {
    const facultiesToSave = await Promise.all(
      data.map(async (facultyData) => {
        const facultyId = facultyData[0];
        const facultyName = facultyData[1];
  
        // Kiểm tra xem khoa đã tồn tại chưa
        const existingFaculty = await this.facultyRepository.findOne({
          where: { facultyId },
        });
  
        if (existingFaculty) {
          // Nếu đã tồn tại, cập nhật thông tin khoa
          existingFaculty.facultyName = facultyName;
          return existingFaculty;
        } else {
          // Nếu chưa tồn tại, tạo khoa mới
          const faculty = new Faculty();
          faculty.facultyId = facultyId;
          faculty.facultyName = facultyName;
          return faculty;
        }
      })
    );
  
    // Lưu danh sách khoa vào database
    await this.facultyRepository.save(facultiesToSave);
  }
}