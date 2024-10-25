import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn} from 'typeorm';
import { StudyFrame } from './StudyFrame';
import { Faculty } from './Faculty';
import { Cycle } from './Cycle';

/**
 * Thực thể chương trình đào tạo áp dụng cho: Ngành, Chu kỳ
 */
@Entity('studyFrame_faculty_cycle')
export class StudyFrame_Faculty_Cycle {
  /**
   * Khóa chính tự động tạo
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Mã Khung ctr đào tạo
   */
  @ManyToOne(() => StudyFrame, studyFrame => studyFrame.frameId, { nullable: false })
  @JoinColumn({ name: 'studyFrameId' })
  studyFrame: StudyFrame;

  /**
   * Mã ngành: Áp dụng cho ngành nào
   */
  @ManyToOne(() => Faculty, faculty => faculty.facultyId, { nullable: false })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  /**
   * Chu kỳ: Áp dụng cho chu kỳ nào
   */
  @ManyToOne(() => Cycle, cycle => cycle.cycleId, { nullable: false })
  @JoinColumn({ name: 'cycleId' })
  cycle: Cycle;
}
