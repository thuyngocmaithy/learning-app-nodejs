import mongoose, { Schema, Document } from 'mongoose';
import { ISubject } from './subject.model';


export interface ISemester extends Document {
  semesterNumber: number;
  subjects: ISubject['_id'][];
}

const semesterSchema = new Schema<ISemester>({
  semesterNumber: { type: Number, required: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject', required: true }]
});

const Semester = mongoose.model<ISemester>('Semester', semesterSchema);

export default Semester;
