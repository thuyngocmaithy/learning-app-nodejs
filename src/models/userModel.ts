import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  mssv: string;
  password: string;
  email: string;
}

const userSchema = new Schema({
  mssv: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;