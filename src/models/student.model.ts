import mongoose, { Schema, Document } from 'mongoose';

interface Istudent extends Document {
  ma_sv: string;
  ten_day_du: string;
  gioi_tinh: string;
  ngay_sinh: Date;
  noi_sinh: string;  
  dien_thoai: string;
  email: string;
  doi_mat_khau: boolean;
  lop: string;
  nganh: string;
  chuyen_nganh: string;
  id_chuyen_nganh: string;
  nien_khoa: string;
  nhhk_vao: number;
  nhhk_ra: number;

}

const studentSchema = new Schema({

});

const student = mongoose.model<Istudent>('student', studentSchema);

export default student;