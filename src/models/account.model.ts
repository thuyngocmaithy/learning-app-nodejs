import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  mssv: string;
  password: string;
  email: string;
  role : string,
  refreshToken?: string;
}

const AccountSchema = new Schema<IAccount>({
  mssv: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'Account'], required: true },
  refreshToken: { type: String, required: true }
});

const Account = mongoose.model<IAccount>('Account', AccountSchema);

export default Account;
