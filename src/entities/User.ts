import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToMany, Index, OneToOne } from 'typeorm';
import { Major } from './Major';
import { Account } from './Account';
import { Notification } from './Notification';
import { Specialization } from './Specialization';

/**
 * Thực thể Người dùng
 */
@Entity()
@Index('IDX_USER_MAJOR', ['major'])
@Index('IDX_USER_SPECIALIZATION', ['specialization'])
export class User {
	/**
	 * Mã người dùng (duy nhất, không rỗng)
	 */
	@PrimaryColumn({ type: 'varchar', length: 25 })
	userId: string;

	/**
	 * Họ và tên (không rỗng)
	 */
	@Column({ nullable: false })
	fullname: string;

	/**
	 * Ngày sinh (có thể rỗng)
	 */
	@Column({ nullable: true })
	dateOfBirth: Date;

	/**
	 * Nơi sinh 
	 */
	@Column({ nullable: true })
	placeOfBirth: string;

	/**
	 * Số điện thoại
	 */
	@Column({ nullable: true })
	phone: string;

	/**
	 * Email
	 */
	@Column({ nullable: true })
	email: string;

	/**
	 * Có phải sinh viên hay không (mặc định là true, không rỗng)
	 */
	@Column({ default: true, nullable: false })
	isStudent: boolean;

	/**
	 * Lớp học (có thể rỗng)
	 */
	@Column({ nullable: true })
	class: string;

	/**
	 * Ngành
	 */
	@ManyToOne(() => Major, data => data.majorId, { nullable: true })
	@JoinColumn({ name: 'majorId' })
	major: Major;


	/**
	 * Chuyên ngành
	 */
	@ManyToOne(() => Specialization, data => data.specializationId, { nullable: true })
	@JoinColumn({ name: 'specializationId' })
	specialization: Specialization;

	/**
	* niên khoá 
	*/
	@Column({ nullable: true })
	nien_khoa: string;

	/**
   * giới tính
   */
	@Column({ nullable: true })
	sex: string;


	/**
	* khoi
	*/
	@Column({ nullable: true })
	khoi: string;

	/**
	* cccd
	*/
	@Column({ nullable: true })
	cccd: string;

	/**
	* bậc hệ đào tạo
	*/
	@Column({ nullable: true })
	bac_he_dao_tao: string;

	/**
	* hoc_vi (giảng viên)
	*/
	@Column({ nullable: true })
	hoc_vi: string;

	/**
	 * Năm học đầu tiên (có thể rỗng)
	 */
	@Column({ type: 'int', nullable: true })
	firstAcademicYear: number;

	/**
	 * Năm học cuối cùng (có thể rỗng)
	 */
	@Column({ type: 'int', nullable: true })
	lastAcademicYear: number;

	/**
	 * Đang hoạt động hay không (mặc định là true, không rỗng)
	 */
	@Column({ default: true, nullable: false })
	isActive: boolean;

	/**
	 * Ảnh đại diện (base64)
	 */
	@Column({ type: 'longtext', nullable: true })
	avatar: string;

	/**
	 * ID tài khoản (tham chiếu đến thực thể Account, rỗng)
	 */
	@OneToOne(() => Account, (account) => account.user, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn()
	account: Account;


	/**
	 * ID người tạo (tham chiếu đến thực thể User, có thể rỗng)
	 */
	@ManyToOne(() => User, data => data.userId, { nullable: true })
	@JoinColumn({ name: 'createUserId' })
	createUser: User;

	/**
	 * Ngày tạo (không rỗng)
	 */
	@CreateDateColumn()
	createDate: Date;

	/**
	 * ID người chỉnh sửa cuối cùng (tham chiếu đến thực thể User, có thể rỗng)
	 */
	@ManyToOne(() => User, data => data.userId, { nullable: true })
	@JoinColumn({ name: 'lastModifyUserId' })
	lastModifyUser: User;

	/**
	 * Ngày chỉnh sửa cuối cùng (không rỗng)
	 */
	@UpdateDateColumn()
	lastModifyDate: Date;
	user: Promise<Major | null>;

	/**
	 * GPA (có thể rỗng)
	 */
	@Column({ type: 'float', nullable: true })
	GPA: number;


	/**
	 * Số tín chỉ hiện tại
	 */
	@Column({ type: 'int', nullable: true })
	currentCreditHour: number;

	// Danh sách thông báo nhận được
	@ManyToMany(() => Notification, (notification) => notification.toUsers)
	receivedNotifications: Notification[];

}
