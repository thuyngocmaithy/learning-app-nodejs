// <--MODELS THỰC TẬP-->
//name
//create date
//
/* địa điểm
lương
số lượng
loại
mô tả
ngành học 
yêu cầu : string
quyền lợi : string
địa điểm : string
id người tạo
ngày tạo
id người update cuối 
ngày update cuối

*/

import mongoose, { Schema, Document } from "mongoose";

export interface IInternship extends Document {
    id: string,
    name : string,
    creater_id: string,
    updater_id: string,
    create_date: Date,
    update_date: Date,
    location: string,
    salary: string | number,
    internNumber: number,
    type: string,
    discription: string,
    major: string,
    require: string,
    benefit: string,
}

const InternSchema: Schema<IInternship> = new Schema<IInternship>({
    id: { type: String, required: true },
    name :  { type: String, required: true },
    creater_id: { type: String, required: true },
    updater_id: { type: String, required: true },
    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },
    location: { type: String, required: true },
    salary: { type: Schema.Types.Mixed, required: true }, // Mixed type allows for string or number
    internNumber: { type: Number, required: true },
    type: { type: String, required: true },
    discription: { type: String, required: true },
    major: { type: String, required: true },
    require: { type: String, required: true },
    benefit: { type: String, required: true },
});

const Internship = mongoose.model<IInternship>("Internship", InternSchema);

export default Internship;

