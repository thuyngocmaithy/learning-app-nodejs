import { Repository, DataSource, FindOneOptions, In } from 'typeorm';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { UserService } from './User.service';

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private userService: UserService;

  constructor(dataSource: DataSource) {
    this.notificationRepository = dataSource.getRepository(Notification);
    this.userService = new UserService(dataSource);
  }

  public getAll = async (): Promise<Notification[]> => {
    return this.notificationRepository.find({
      relations: ['toUser', 'createUser']
    });
  }

  public getById = async (id: string): Promise<Notification | null> => {
    const options: FindOneOptions<Notification> = {
      where: { id },
      relations: ['toUser', 'createUser']
    };
    return this.notificationRepository.findOne(options);
  }

  public create = async (notificationData: Partial<Notification>): Promise<Notification> => {
    const notification = this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(notification);
  }

  public update = async (id: string, notificationData: Partial<Notification>): Promise<Notification | null> => {
    await this.notificationRepository.update(id, notificationData);
    const options: FindOneOptions<Notification> = {
      where: { id },
      relations: ['toUser', 'createUser']
    };
    return this.notificationRepository.findOne(options);
  }

  async delete(ids: string[]): Promise<boolean> {
    const result = await this.notificationRepository.delete({ id: In(ids) });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }


  async getWhere(condition: Partial<Notification>): Promise<Notification[]> {
    const whereCondition: any = {};


    if (condition.toUser) {
      whereCondition.toUser = { userId: condition.toUser.userId };
    }

    if (condition.createUser) {
      whereCondition.createUser = { userId: condition.createUser.userId };
    }

    if (condition.title) {
      whereCondition.title = condition.title;
    }

    if (condition.content) {
      whereCondition.content = condition.content;
    }

    if (condition.url) {
      whereCondition.url = condition.url;
    }

    return this.notificationRepository.find({
      where: whereCondition,
      relations: ['toUser', 'createUser']
    });
  }

  public getByUserId = async (toUserId: string): Promise<Notification[]> => {
    const toUser = await this.userService.getByUserId(toUserId);

    if (!toUser) {
      throw new Error('User not found');
    }

    const options: FindOneOptions<Notification> = {
      order: { createDate: 'DESC' },
      where: {
        toUser: { userId: toUser.userId },
        disabled: false
      },
      relations: ['toUser', 'createUser']
    };
    const notifications = await this.notificationRepository.find(options);

    return notifications;
  }
}