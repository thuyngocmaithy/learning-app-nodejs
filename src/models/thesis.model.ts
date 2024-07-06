//ID
//name
//status 
//date
//khoa
//thời gian thực hiện
//start date
//finish date
//description
//attech : list
//user (who created?)
//create date
//user (who changed?)
//update/edit when? 
//participater

import mongoose, { Schema, Document } from "mongoose";
import { IFollower } from "./follower.models";

export interface IThesis extends Document {
    thesisId: string;
    name: string;
    status: string;
    create_user: string;
    update_user: string;
    createDate: Date;
    updateDate: Date;
    start_Date: Date;
    finish_Date: Date;
    completion_time: Date;
    description: string;
    participater: IFollower[]; // Reference to followers
}

const thesisSchema: Schema<IThesis> = new Schema<IThesis>({
    thesisId: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    create_user: { type: String, required: true },
    update_user: { type: String, required: true },
    createDate: { type: Date, required: true },
    updateDate: { type: Date, required: true },
    start_Date: { type: Date, required: true },
    finish_Date: { type: Date, required: true },
    completion_time: { type: Date, required: true },
    description: { type: String, required: true },
    participater    : [{ type: Schema.Types.ObjectId, ref: 'Follower' }] // Reference to Follower schema
});

const Thesis = mongoose.model<IThesis>('Thesis', thesisSchema);
export default Thesis;