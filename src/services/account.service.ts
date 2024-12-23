// account.service.ts
import { DataSource, In, Repository } from 'typeorm';
import { Account } from '../entities/Account';
import * as bcrypt from 'bcrypt';
import { Permission } from '../entities/Permission';
import { User } from '../entities/User';

export class AccountService {
	private accountRepository: Repository<Account>;
	private userRepository: Repository<User>;

	constructor(dataSource: DataSource) {
		this.accountRepository = dataSource.getRepository(Account);
		this.userRepository = dataSource.getRepository(User);
	}

	async create(data: Partial<Account>): Promise<Account> {
		// 1. Tạo tài khoản
		const account = this.accountRepository.create(data);
		const password = data.password ?? '12345678';
		account.password = await bcrypt.hash(password, 10);
		const savedAccount = await this.accountRepository.save(account);

		// 2. Tạo người dùng và gắn tài khoản
		const user = this.userRepository.create({
			account: savedAccount, // Liên kết tài khoản vừa tạo
			userId: data.username,
			fullname: data.username,
			isStudent: false
		});
		await this.userRepository.save(user);

		// 3. Trả về tài khoản đã lưu, có thể thêm thông tin user nếu cần
		return savedAccount;
	}

	async getAll(): Promise<Account[]> {
		return this.accountRepository.find({
			order: { createDate: "DESC" },
			relations: ['permission']
		});
	}

	async getById(id: string): Promise<Account | null> {
		return this.accountRepository.findOne({ where: { username: id }, relations: ['permission'] });
	}

	async getByUsername(username: string): Promise<Account | null> {
		return this.accountRepository.findOne({ where: { username }, relations: ['permission'] });
	}

	async update(id: string, data: Partial<Account>): Promise<Account | null> {
		const account = await this.accountRepository.findOne({ where: { id } });
		if (!account) {
			return null;
		}

		this.accountRepository.merge(account, data);
		return this.accountRepository.save(account);
	}

	async delete(ids: string[]): Promise<boolean> {
		const result = await this.accountRepository.delete({ id: In(ids) });
		return result.affected !== 0;
	}

	async getWhere(condition: Partial<Account> & { isUnused?: boolean }): Promise<Account[]> {
		const query = this.accountRepository.createQueryBuilder('account')
			.leftJoinAndSelect('account.permission', 'permission'); // Quan hệ với Permission

		// Điều kiện isSystem
		if (condition.isSystem !== undefined) {
			query.andWhere('account.isSystem = :isSystem', { isSystem: condition.isSystem });
		}

		// Điều kiện tài khoản chưa được sử dụng
		if (condition.isUnused) {
			query.leftJoin('User', 'user', 'user.accountId = account.id') // Liên kết với bảng User
				.andWhere('user.userId IS NULL'); // Điều kiện: Không có User nào liên kết
		}

		// Sắp xếp theo ngày tạo
		query.orderBy('account.createDate', 'DESC');

		return query.getMany();
	}


}
