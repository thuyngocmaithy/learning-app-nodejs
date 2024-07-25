//name
//tinchi
//divide 
//id monhoc truoc
//môn học tương đương
//môn học tương đương : true | false

import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
    idMonhoc: string;
    tenMonHoc: string;
    tinchi: number;
    divide: boolean;
    idMonhoc_truoc?: string;
    haveMonhoctuongduong: boolean;
    idMonhoctuongduong?: string;
}

const subjectSchema: Schema<ISubject> = new Schema<ISubject>({
    idMonhoc: { type: String, required: true, unique: true },
    tenMonHoc: { type: String, required: true },
    tinchi: { type: Number, required: true },
    divide: { type: Boolean, required: true },
    idMonhoc_truoc: { type: String, required: false },
    haveMonhoctuongduong: { type: Boolean, required: true },
    idMonhoctuongduong: { type: String, required: false }
});

const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
export default Subject;

