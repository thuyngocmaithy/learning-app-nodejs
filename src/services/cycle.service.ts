import { DataSource, In, Repository } from 'typeorm';
import { Cycle } from '../entities/Cycle';

export class CycleService {
  private cycleRepository: Repository<Cycle>;

  constructor(dataSource: DataSource) {
    this.cycleRepository = dataSource.getRepository(Cycle);
  }

  async create(data: Partial<Cycle>): Promise<Cycle> {
		const newId = await this.generateNewId();
    data = {
      ...data,
      cycleId: newId
    }
    const cycle = this.cycleRepository.create(data);
    return this.cycleRepository.save(cycle);
  }

  async getAll(): Promise<Cycle[]> {
    return this.cycleRepository.find({
      order: {
        cycleId: 'ASC', 
      },
    });
  }

  async getById(id: string): Promise<Cycle | null> {
    return this.cycleRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Cycle>): Promise<Cycle | null> {
    const cycle = await this.cycleRepository.findOne({ where: { id } });
    if (!cycle) {
      return null;
    }

    this.cycleRepository.merge(cycle, data);
    return this.cycleRepository.save(cycle);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.cycleRepository.delete({ id: In(ids) });
    return result.affected !== 0;
  }

	private generateNewId = async (): Promise<string> => {
		const lastCycle = await this.cycleRepository.find({
			order: { cycleId: 'DESC' },
      take: 1,
		});

    const oneLastCycle = lastCycle.length > 0 ? lastCycle[0] : null;

		let numericPart = 1;
		if (oneLastCycle) {
			const match = oneLastCycle.cycleId.match(/\d+$/); // Regex lấy phần số cuối cùng của chuỗi
			const lastNumericPart = match ? parseInt(match[0], 10) : 0; // Nếu có kết quả, chuyển đổi thành số

			numericPart = lastNumericPart + 1;
		}
		// Format the new ID
		return `CYCLE${numericPart.toString().padStart(3, '0')}`;
	}

}
