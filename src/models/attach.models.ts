import { Schema, model } from 'mongoose';


export interface IAttachment extends Document {
  filename: string,
  contentType: string,
  data :string,
  createBy : string,
  createAt : Date,
  updateAt : Date,
}


const attachmentSchema = new Schema({
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

const Attachment = model<IAttachment>('Attachment', attachmentSchema);
export default Attachment;
