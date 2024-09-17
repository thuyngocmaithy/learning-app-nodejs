// account.service.ts
import { DataSource, Repository } from 'typeorm';
import { Account } from '../entities/Account';
import * as bcrypt from 'bcrypt';
import { Permission } from '../entities/Permission';

export class AccountService {
  private accountRepository: Repository<Account>;
  private permissionRepository: Repository<Permission>;

  constructor(dataSource: DataSource) {
    this.accountRepository = dataSource.getRepository(Account);
    this.permissionRepository = dataSource.getRepository(Permission);
  }

  async create(data: Partial<Account>): Promise<Account> {
    const account = this.accountRepository.create(data);
    return this.accountRepository.save(account);
  }

  async getAll(): Promise<Account[]> {
    return this.accountRepository.find({ relations: ['permission'] });
  }

  async getById(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { id }, relations: ['permission'] });
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

  async delete(id: string): Promise<boolean> {
    const result = await this.accountRepository.delete({ id });
    return result.affected !== 0;
  }


}
