// import { Column, Entity, PrimaryColumn } from "typeorm";

// /**
//  * Thực thể Năm học
//  */
// @Entity()
// export class AcademicYear {
//   /**
//    * Khóa chính
//    */
//   @PrimaryColumn({ type: 'varchar', length: 25 })
//   yearId: string;

//   /**
//    * Năm học (duy nhất, không rỗng)
//    */
//   @Column({ unique: true, nullable: false })
//   year: string;
// }