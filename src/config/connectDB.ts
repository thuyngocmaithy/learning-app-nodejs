import mongoose from 'mongoose';
import dotenv from 'dotenv';

  
//Nạp các biến môi trường từ file .env
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected into ' + process.env.MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(col => col.name));
    require('../models');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

export default connectDB;
