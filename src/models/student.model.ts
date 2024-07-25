import mongoose, { Schema, Document } from 'mongoose';
import { ISubject } from './subject.model';

export interface IStudent extends Document {
  ma_sv: string;
  fullname: string;
  sex: string;
  date_of_birth: Date;
  place_of_birth: string;
  phone: string;
  email: string;
  class: string;
  major: string;
  specialization: string;
  specializationID: string;
  nien_khoa: string;
  first_academic_year: number;
  last_academic_year: number;
  subjects_completed: ISubject[];  // Reference to completed subjects
}

const studentSchema: Schema<IStudent> = new Schema<IStudent>({
  ma_sv: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  sex: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  place_of_birth: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  class: { type: String, required: true },
  major: { type: String, required: true },
  specialization: { type: String, required: true },
  specializationID: { type: String, required: true },
  nien_khoa: { type: String, required: true },
  first_academic_year: { type: Number, required: true },
  last_academic_year: { type: Number, required: true },
  subjects_completed: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]
});

const Student = mongoose.model<IStudent>('Student', studentSchema);
export default Student;
