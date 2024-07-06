//id parent - id của khoá luận, thực tập , nghiên cứu 
// name 


import mongoose, { Schema, Document } from "mongoose";

export interface IFollower extends Document {
    idParent: string;
    name: string;
}

const followerSchema: Schema<IFollower> = new Schema<IFollower>({
    idParent: { type: String, required: true },
    name: { type: String, required: true }
});

const Follower = mongoose.model<IFollower>('Follower', followerSchema);
export default Follower;
