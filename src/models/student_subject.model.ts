//tham chiếu

import mongoose, { Schema, Document } from 'mongoose';
import { IStudent } from './student.model';
import { ISubject } from './subject.model';

interface IEnrollment extends Document {
  student: IStudent['_id'];
  subject: ISubject['_id'];
  enrollmentDate: Date;
  grade?: string;
}

const enrollmentSchema = new Schema<IEnrollment>({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  enrollmentDate: { type: Date, required: true },
  grade: { type: String, required: false }
});

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;
