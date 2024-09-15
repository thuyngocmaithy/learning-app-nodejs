import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { Faculty } from './Faculty';
import { Major } from './Major';
import { Account } from './Account';

/**
 * Thực thể Người dùng
 */
@Entity()
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
   * Ngày sinh (không rỗng)
   */
  @Column({ nullable: false })
  dateOfBirth: Date;

  /**
   * Nơi sinh (không rỗng)
   */
  @Column({ nullable: false })
  placeOfBirth: string;

  /**
   * Số điện thoại (không rỗng)
   */
  @Column({ nullable: false })
  phone: string;

  /**
   * Email (không rỗng)
   */
  @Column({ nullable: false })
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
   * ID khoa (tham chiếu đến thực thể Faculty, có thể rỗng)
   */
  @ManyToOne(() => Faculty, data => data.facultyId, { nullable: true })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  /**
   * ID chuyên ngành (tham chiếu đến thực thể Major, có thể rỗng)
   */
  @ManyToOne(() => Major, data => data.majorId, { nullable: true })
  @JoinColumn({ name: 'majorId' })
  major: Major;

  /**
   * Vẫn còn học hay không (có thể rỗng)
   */
  @Column({ nullable: true })
  stillStudy: boolean;

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
* dan_toc
*/
  @Column({ nullable: true })
  dan_toc: string;

  /**
 * ton_giao
 */
  @Column({ nullable: true })
  ton_giao: string;

  /**
* quoc_tich
*/
  @Column({ nullable: true })
  quoc_tich: string;

  /**
* cccd
*/
  @Column({ nullable: true })
  cccd: string;

  /**
* hộ khẩu
*/
  @Column({ nullable: true })
  ho_khau_thuong_tru: string;

  /**
 * khu vuc
 */
  @Column({ nullable: true })
  khu_vuc: string;

  /**
  * khoi
  */
  @Column({ nullable: true })
  khoi: string;


  /**
  * bậc hệ đào tạo
  */
  @Column({ nullable: true })
  bac_he_dao_tao: string;


  /**
  * mã cố vấn học tập
  */
  @Column({ nullable: true })
  ma_cvht: string;

  /**
  * ho ten cố vấn học tập
  */
  @Column({ nullable: true })
  ho_ten_cvht: string;


  /**
  * email_cvht
  */
  @Column({ nullable: true })
  email_cvht: string;


  /**
  * email_cvht
  */
  @Column({ nullable: true })
  dien_thoai_cvht: string;


  /**
* mã cố vấn học tập 2
*/
  @Column({ nullable: true })
  ma_cvht_ng2: string;

  /**
  * ho ten cố vấn học tập 2
  */
  @Column({ nullable: true })
  ho_ten_cvht_ng2: string;


  /**
  * email_cvht 2
  */
  @Column({ nullable: true })
  email_cvht_ng2: string;


  /**
  * dien_thoai_cvht_ng2  
  */
  @Column({ nullable: true })
  dien_thoai_cvht_ng2: string;


  /**
  * ma-truong 
  */
  @Column({ nullable: true })
  ma_truong: string;

  /**
  * ten_truong
  */
  @Column({ nullable: true })
  ten_truong: string;

  /**
  * hoc_vi (giảng viên)
  */
  @Column({ nullable: true })
  hoc_vi: string;

  /**
  * bo_mon (giảng viên)
  */
  @Column({ nullable: true })
  bo_mon: string;

  /**
   * Năm học đầu tiên (có thể rỗng)
   */
  @Column({ nullable: true })
  firstAcademicYear: number;

  /**
   * Năm học cuối cùng (có thể rỗng)
   */
  @Column({ nullable: true })
  lastAcademicYear: number;

  /**
   * Đang hoạt động hay không (mặc định là false, không rỗng)
   */
  @Column({ default: false, nullable: false })
  isActive: boolean;

  /**
   * Ảnh đại diện (base64)
   */
  @Column({ type: 'longtext', nullable: true })
  avatar: string;

  /**
   * ID tài khoản (tham chiếu đến thực thể Account, rỗng)
   */
  @ManyToOne(() => Account, data => data.id, { nullable: true })
  @JoinColumn({ name: 'accountId' })
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
}
