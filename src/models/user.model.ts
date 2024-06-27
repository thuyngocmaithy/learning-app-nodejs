import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  mssv: string;
  password: string;
  email: string;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>({
  mssv: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
