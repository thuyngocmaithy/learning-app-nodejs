//id
//namhoc :string
//subjectList
//semesterPick : 1 2 3
import mongoose, { Schema, Document } from 'mongoose';
import { ISemester } from './semester.model';

export interface IAcademicYear extends Document {
  year: string;
  semesters: ISemester['_id'][];
}

const academicYearSchema = new Schema<IAcademicYear>({
  year: { type: String, required: true },
  semesters: [{ type: Schema.Types.ObjectId, ref: 'Semester', required: true }]
});

const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', academicYearSchema);

export default AcademicYear;

