import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Semester } from './Semester';
import { Subject } from "./Subject";



@Entity()
export class Subject_Semester {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Subject, subject => subject.subjectId, { nullable: false })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;

    @ManyToOne(() => Semester, semester => semester.semesterId, { nullable: true })
    semester: Semester;
}
