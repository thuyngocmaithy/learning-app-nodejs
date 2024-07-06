//khung đào tạo
// kiến thức chuyên ngành :-> divide : true
//kiến thức đại cương -> divide : false 
//id, name,dive, chidren

import mongoose, { Schema, Document } from 'mongoose';
import { ISubject } from './subject.model';

interface IStudyFrame extends Document {
    name: string;
    divide: boolean;
    compulsorySubjects: ISubject[];
    electiveSubjects: ISubject[];
    subcategories?: IStudyFrame[];
}

const StudyFrameSchema: Schema<IStudyFrame> = new Schema<IStudyFrame>({
    name: { type: String, required: true },
    divide: { type: Boolean, required: true },
    compulsorySubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject', required: false }],
    electiveSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject', required: false }],
    subcategories: [{ type: Schema.Types.ObjectId, ref: 'StudyFrame', required: false }]
});

const StudyFrame = mongoose.model<IStudyFrame>('StudyFrame', StudyFrameSchema);
export default StudyFrame;
