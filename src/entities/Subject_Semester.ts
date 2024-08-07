import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Semester } from './Semester';
import { Subject } from "./Subject";



@Entity()
export class Subject_Semester {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Subject, subject => subject.subjectId, { nullable: false })
    @JoinColumn({ name: 'subjectId', referencedColumnName: 'subjectId' })
    subject: Subject;

    @ManyToOne(() => Semester, semester => semester.id, { nullable: false })
    @JoinColumn({ name: 'semesterId', referencedColumnName: 'id' })
    semester: Semester;
}
