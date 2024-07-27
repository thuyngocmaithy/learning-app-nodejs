import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Tiến độ
@Entity()
export class Progress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: ['Tiến độ học tập', 'Tiến độ dự án nghiên cứu', 'Tiến độ khóa luận', 'Tiến độ thực tập'],
  })
  type: 'Tiến độ học tập' | 'Tiến độ dự án nghiên cứu' | 'Tiến độ khóa luận' | 'Tiến độ thực tập' = "Tiến độ học tập";

  @Column({ type: 'simple-array', nullable: true })
  checkpoints: string[] = [];
}