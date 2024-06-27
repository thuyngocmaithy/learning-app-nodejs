import mongoose, { Schema, Document } from 'mongoose';

interface ITenMobile {
  nhom: string;
  ten_eng: string;
}

interface IChucNang extends Document {
  id: string;
  ma_chuc_nang: string;
  ma_menu: string;
  thu_tu: number;
  ten_hien_thi: string;
  ten_mobile: ITenMobile;
  ten_hien_thi_Eg: string;
  ten_tooltip: string;
  url: string;
  url_danh_muc_hoc_lieu: string;
  ds_chi_tiet: any[];
}

const chucNangSchema = new Schema({
  id: { type: String, required: true },
  ma_chuc_nang: { type: String, required: true },
  ma_menu: { type: String },
  thu_tu: { type: Number, required: true },
  ten_hien_thi: { type: String, required: true },
  ten_mobile: {
    nhom: { type: String },
    ten_eng: { type: String }
  },
  ten_hien_thi_Eg: { type: String, required: true },
  ten_tooltip: { type: String, required: true },
  url: { type: String, required: true },
  url_danh_muc_hoc_lieu: { type: String },
  ds_chi_tiet: [{ type: Schema.Types.Mixed }]
});

const ChucNang = mongoose.model<IChucNang>('ChucNang', chucNangSchema);

export default ChucNang;