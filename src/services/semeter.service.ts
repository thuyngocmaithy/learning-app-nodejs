
import { DataSource, In, Repository } from 'typeorm';
import { Semester } from '../entities/Semester';
import { Cycle } from '../entities/Cycle';

export class SemesterService {
  private semesterRepository: Repository<Semester>;
  private cycleRepository: Repository<Cycle>;

  constructor(dataSource: DataSource) {
    this.semesterRepository = dataSource.getRepository(Semester);
    this.cycleRepository = dataSource.getRepository(Cycle);
  }

  async create(data: any): Promise<Semester> {
    const cycle = await this.cycleRepository.findOneBy({cycleId: data.cycle});
    if(!cycle)
    {
      throw new Error('SemesterService - create - Not found cycle');
    }

    const newId = await this.generateNewId();
    
    const semesterData = {      
      semesterId: newId,
      semesterName: data.semesterName,
      cycle: cycle,
      academicYear: data.academicYear
    }

    const semester = this.semesterRepository.create(semesterData);
    return this.semesterRepository.save(semester);
  }

  async getAll(): Promise<Semester[]> {
    return this.semesterRepository.find({ relations: ['cycle'] });
  }

  async getById(semesterId: string): Promise<Semester | null> {
    return this.semesterRepository.findOne({ where: { semesterId }, relations: ['cycle'] });
  }

  async update(semesterId: string, data: any): Promise<Semester | null> {
    // Tìm entity cycle
    const cycle = await this.cycleRepository.findOneBy({cycleId: data.cycle});
    if(!cycle)
    {
      throw new Error('SemesterService - create - Not found cycle');
    }

    // Tìm entity semester update theo id
    const semester = await this.semesterRepository.findOne({ where: { semesterId }, relations: ['cycle'] });
    if (!semester) {
      return null;
    }

    // Tạo semesterData update
    const semesterData = {      
      cycle: cycle,
      academicYear: data.academicYear
    }

    this.semesterRepository.merge(semester, semesterData);
    return this.semesterRepository.save(semester);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.semesterRepository.delete({ semesterId: In(ids) });
    return result.affected !== 0;
  }

  private generateNewId = async (): Promise<string> => {
		const lastSemester = await this.semesterRepository.find({
			order: { semesterId: 'DESC' },
      take: 1,
		});

    const oneLastSemester = lastSemester.length > 0 ? lastSemester[0] : null;

		let numericPart = 1;
		if (oneLastSemester) {
			const match = oneLastSemester.semesterId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
			const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

			numericPart = lastNumericPart + 1;
		}
		// Format the new ID
		return `SEMESTER${numericPart.toString().padStart(3, '0')}`;
	}
}