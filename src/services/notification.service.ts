import { Repository, DataSource, FindOneOptions, In, Like } from 'typeorm';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { UserService } from './User.service';

export class NotificationService {
	private notificationRepository: Repository<Notification>;
	private userRepository: Repository<User>;
	private userService: UserService;

	constructor(dataSource: DataSource) {
		this.notificationRepository = dataSource.getRepository(Notification);
		this.userRepository = dataSource.getRepository(User);
		this.userService = new UserService(dataSource);
	}

	public getAll = async (): Promise<Notification[]> => {
		return this.notificationRepository.find({
			relations: ['toUsers', 'toUsers.user', 'createUser'],
			order: { createDate: 'DESC' },
		});
	}

	public getById = async (id: string): Promise<Notification | null> => {
		const options: FindOneOptions<Notification> = {
			where: { id },
			order: { createDate: 'DESC' },
			relations: ['toUsers', 'toUsers.user', 'createUser']
		};
		return this.notificationRepository.findOne(options);
	}

	public create = async (notificationData: Partial<Notification>): Promise<Notification> => {
		// Lấy danh sách user nhận thông báo
		const userIds = notificationData.toUsers;

		if (!userIds || userIds.length === 0) {
			throw new Error('Danh sách người nhận thông báo rỗng');
		}

		// Truy vấn tất cả các User từ danh sách userIds
		const toUsers = await this.userRepository.findBy({ userId: In(userIds) });
		if (toUsers.length !== userIds.length) {
			throw new Error('Không tìm thấy tất cả người nhận');
		}

		if (!notificationData.createUser) {
			throw new Error('Không có createUser');
		}
		// Tìm createUser
		const createUser = await this.userRepository.findOneBy({ userId: notificationData.createUser?.userId });
		if (!createUser) {
			throw new Error('Không tìm thấy createUser');
		}

		notificationData.createUser = createUser;

		// Tạo instance của thông báo
		const notification = this.notificationRepository.create({
			...notificationData,
			toUsers, // Gán danh sách người nhận vào thông báo
		});

		// Lưu thông báo vào database (bao gồm cả bảng trung gian)
		return this.notificationRepository.save(notification);
	};

	public update = async (id: string, notificationData: Partial<Notification>): Promise<Notification | null> => {
		// Tìm thông báo cần cập nhật, bao gồm quan hệ toUsers
		const existingNotification = await this.notificationRepository.findOne({
			where: { id },
			relations: ['toUsers', 'createUser'],
		});

		if (!existingNotification) {
			return null; // Trả về null nếu thông báo không tồn tại
		}


		// Nếu trong notificationData có truyền isRead hoặc disabled thì không cập nhật toUsers
		if (notificationData.isRead === undefined && notificationData.disabled === undefined) {
			// Lấy danh sách người dùng hiện tại (toUsers)
			const currentToUsers = existingNotification.toUsers;


			// Nếu không có danh sách toUsers mới trong notificationData, xóa tất cả người dùng hiện tại
			const newToUserIds = notificationData.toUsers || [];


			// Truy vấn tất cả các User từ danh sách userIds
			const newToUsers = await this.userRepository.findBy({ userId: In(newToUserIds) });
			if (newToUsers.length !== newToUsers.length) {
				throw new Error('Không tìm thấy tất cả người nhận');
			}
			notificationData.toUsers = newToUsers;

			if (newToUsers.length === 0) {
				// Xóa tất cả người dùng khỏi thông báo
				existingNotification.toUsers = [];
			} else {
				// Xử lý thêm người dùng mới vào toUsers và xóa người dùng không còn trong danh sách
				const newUserIds = newToUsers.map(user => user.userId);

				// Lọc ra những người dùng còn lại trong danh sách
				existingNotification.toUsers = currentToUsers.filter(user => newUserIds.includes(user.userId));

				// Thêm những người dùng mới chưa có trong danh sách
				for (let user of newToUsers) {
					const userEntity = await this.userRepository.findOne({ where: { userId: user.userId } });
					if (userEntity && !existingNotification.toUsers.some(existingUser => existingUser.userId === userEntity.userId)) {
						// Nếu người dùng chưa có trong danh sách, thêm vào
						existingNotification.toUsers.push(userEntity);
					}
				}
			}
		}
		// Cập nhật các trường khác của thông báo nếu có thay đổi
		const updatedNotification = this.notificationRepository.merge(existingNotification, notificationData);

		// Lưu thông báo và cập nhật bảng trung gian nếu cần
		await this.notificationRepository.save(updatedNotification);

		// Trả về thông báo đã được cập nhật (bao gồm các mối quan hệ)
		return this.notificationRepository.findOne({
			where: { id },
			relations: ['toUsers', 'createUser'],
		});
	};

	async updateMulti(ids: string[], data: Partial<Notification>): Promise<Notification[] | null> {
		// Tìm tất cả các bản ghi với ids trong mảng
		const notiList = await this.notificationRepository.find({
			where: { id: In(ids) }
		});

		// Nếu không tìm thấy bản ghi nào
		if (notiList.length === 0) {
			return null;
		}

		// Cập nhật từng bản ghi
		notiList.forEach((noti) => {
			this.notificationRepository.merge(noti, data);
		});

		// Lưu tất cả các bản ghi đã cập nhật
		return this.notificationRepository.save(notiList);
	}



	async delete(ids: string[]): Promise<boolean> {
		// Tìm thông báo cần xóa để xử lý các mối quan hệ nếu cần
		const notificationsToDelete = await this.notificationRepository.find({
			where: { id: In(ids) },
			relations: ['toUsers'], // Tải danh sách người nhận để xử lý quan hệ ManyToMany
		});

		if (notificationsToDelete.length === 0) {
			return false; // Không có thông báo nào được tìm thấy
		}

		// Xóa thông báo (bao gồm cả mối quan hệ trong bảng trung gian nếu cascade được bật)
		const result = await this.notificationRepository.delete({ id: In(ids) });

		return result.affected !== null && result.affected !== undefined && result.affected > 0;
	}


	async getWhere(condition: any): Promise<Notification[]> {
		const whereCondition: any[] = []; // Chứa các điều kiện OR

		// Điều kiện cho toUsers (tìm thông báo gửi tới người dùng)
		if (condition.toUsers) {
			let toUsers;
			if (typeof condition.createUser === 'string') {
				toUsers = JSON.parse(condition.toUsers);
			} else {
				toUsers = condition.toUsers;  // Nếu đã là object, không cần parse
			}
			if (Array.isArray(toUsers) && toUsers.length > 0) {
				const userIds = toUsers.map(user => user.userId); // Mảng userId
				whereCondition.push({ toUsers: { userId: In(userIds) } }); // Thêm điều kiện OR cho toUsers
			}
		}

		// Điều kiện cho createUser (tìm thông báo do người dùng tạo với isSystem = 1)
		if (condition.createUser) {
			let createUser;
			// Kiểm tra nếu là chuỗi thì parse, còn nếu là object thì sử dụng luôn
			if (typeof condition.createUser === 'string') {
				createUser = JSON.parse(condition.createUser);
			} else {
				createUser = condition.createUser;  // Nếu đã là object, không cần parse
			}

			// Kiểm tra nếu createUser tồn tại và có userId
			if (createUser && createUser.userId) {
				whereCondition.push({
					createUser: { userId: createUser.userId },
					isSystem: 1
				}); // Thêm điều kiện cho createUser và isSystem = 1
			}
		}

		// Thêm điều kiện mặc định (nếu có)
		const additionalConditions: any = {};
		if (condition.title) {
			additionalConditions.title = condition.title;
		}
		if (condition.content) {
			additionalConditions.content = condition.content;
		}
		if (condition.url) {
			additionalConditions.url = condition.url;
		}

		// Tích hợp các điều kiện phụ vào điều kiện OR
		if (additionalConditions) {
			whereCondition.push(additionalConditions);
		}

		// Tìm kiếm trong repository
		const notifications = await this.notificationRepository.find({
			where: whereCondition.length > 0 ? whereCondition : undefined, // Chỉ dùng where nếu có điều kiện
			relations: ['toUsers', 'createUser'],
			order: { createDate: 'DESC' },
		});

		// Loại bỏ các thông báo trùng lặp
		const uniqueNotifications = notifications.filter((value, index, self) =>
			index === self.findIndex((t) => (
				t.id === value.id
			))
		);

		return uniqueNotifications;
	}


	async getWhereFilter(condition: any): Promise<Notification[]> {
		const whereCondition: any = {};

		// Điều kiện cho toUsers
		if (condition.toUsers) {
			whereCondition.toUsers = { fullname: Like(`%${condition.toUsers}%`) };
		}

		// Điều kiện cho createUser
		if (condition.createUser) {
			whereCondition.createUser = { fullname: Like(`%${condition.createUser}%`) };
		}

		// Thêm các điều kiện bổ sung
		if (condition.title) {
			whereCondition.title = Like(`%${condition.title}%`);
		}
		if (condition.content) {
			whereCondition.content = Like(`%${condition.content}%`);
		}
		if (condition.url) {
			whereCondition.url = Like(`%${condition.url}%`);
		}

		// Tìm kiếm trong repository
		const notifications = await this.notificationRepository.find({
			where: whereCondition, // Sử dụng điều kiện dạng AND
			relations: ['toUsers', 'createUser'],
			order: { createDate: 'DESC' },
		});

		return notifications;
	}



	public getByUserId = async (toUsersId: string): Promise<Notification[]> => {
		// Lấy người dùng từ service (có thể chỉ trả về một User)
		const toUser = await this.userService.getByUserId(toUsersId);

		if (!toUser) {
			throw new Error('User not found');
		}

		// Truy vấn thông báo mà người dùng này nhận
		const options: FindOneOptions<Notification> = {
			order: { createDate: 'DESC' },
			where: {
				toUsers: { userId: toUser.userId },  // Tìm thông báo cho người dùng duy nhất
				disabled: false
			},
			relations: ['toUsers', 'createUser']
		};

		// Truy vấn các thông báo		
		const notifications = await this.notificationRepository.find(options);

		return notifications;
	};


}