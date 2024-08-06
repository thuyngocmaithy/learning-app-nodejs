import { Repository, DataSource, FindOneOptions } from 'typeorm';
import { Notification } from '../entities/Notification';

export class NotificationService {
  private notificationRepository: Repository<Notification>;

  constructor(dataSource: DataSource) {
    this.notificationRepository = dataSource.getRepository(Notification);
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

  public delete = async (id: string): Promise<boolean> => {
    const result = await this.notificationRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}