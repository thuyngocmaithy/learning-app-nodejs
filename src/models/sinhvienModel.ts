import mongoose, { Schema, Document } from 'mongoose';

interface ISinhVien extends Document {
  thoi_gian_get_data: Date;
  ma_sv: string;
  ten_day_du: string;
  gioi_tinh: string;
  ngay_sinh: Date;
  noi_sinh: string;
  dan_toc: string;
  ton_giao: string;
  quoc_tich: string;
  dien_thoai: string;
  email: string;
  dien_thoai2: string;
  email2: string;
  doi_mat_khau: boolean;
  so_cmnd: string;
  ho_khau_thuong_tru_gd: string;
  lop: string;
  khu_vuc: string;
  doi_tuong_uu_tien: string;
  doi_tuong_xet_TN: string;
  khoi: string;
  nganh: string;
  chuyen_nganh: string;
  id_chuyen_nganh: string;
  khoa: string;
  bac_he_dao_tao: string;
  nien_khoa: string;
  ma_cvht: string;
  ho_ten_cvht: string;
  email_cvht: string;
  dien_thoai_cvht: string;
  ma_cvht_ng2: string;
  ho_ten_cvht_ng2: string;
  email_cvht_ng2: string;
  dien_thoai_cvht_ng2: string;
  ma_truong: string;
  ten_truong: string;
  id_dia_phuong: string;
  id_khoa: string;
  id_sinh_vien: string;
  id_lop: string;
  id_khoi: string;
  id_bac_he_nganh: string;
  id_bac_he: string;
  id_he: string;
  id_quy_che: string;
  id_quy_che_P: string;
  id_hoc_che: string;
  id_don_vi_phan_cap: string;
  id_co_so_lop: string;
  nhhk_vao: number;
  nhhk_ra: number;
  id_lop2: string;
  id_khoi2: string;
  id_bac_he_nganh2: string;
  chuyen_nganh2: string;
  is_master_pass: boolean;
  is_cvht_dang_nhap: boolean;
  is_phu_huynh_dang_nhap: boolean;
  int_hien_dien_sv: number;
  hien_dien_sv: string;
  int_hien_dien_dkmh: number;
  ds_menu_cam_xem: string[];
  str_hoan_thanh_dgrl: string;
  str_dieu_kien_dk: string;
  url_netweb: string;
}

const sinhVienSchema = new Schema({
  thoi_gian_get_data: { type: Date, required: true },
  ma_sv: { type: String, required: true },
  ten_day_du: { type: String, required: true },
  gioi_tinh: { type: String, required: true },
  ngay_sinh: { type: Date, required: true },
  noi_sinh: { type: String, required: true },
  dan_toc: { type: String, required: true },
  ton_giao: { type: String },
  quoc_tich: { type: String },
  dien_thoai: { type: String, required: true },
  email: { type: String, required: true },
  dien_thoai2: { type: String },
  email2: { type: String },
  doi_mat_khau: { type: Boolean, required: true },
  so_cmnd: { type: String, required: true },
  ho_khau_thuong_tru_gd: { type: String, required: true },
  lop: { type: String, required: true },
  khu_vuc: { type: String, required: true },
  doi_tuong_uu_tien: { type: String, required: true },
  doi_tuong_xet_TN: { type: String },
  khoi: { type: String, required: true },
  nganh: { type: String, required: true },
  chuyen_nganh: { type: String, required: true },
  id_chuyen_nganh: { type: String, required: true },
  khoa: { type: String, required: true },
  bac_he_dao_tao: { type: String, required: true },
  nien_khoa: { type: String, required: true },
  ma_cvht: { type: String, required: true },
  ho_ten_cvht: { type: String, required: true },
  email_cvht: { type: String, required: true },
  dien_thoai_cvht: { type: String, required: true },
  ma_cvht_ng2: { type: String },
  ho_ten_cvht_ng2: { type: String },
  email_cvht_ng2: { type: String },
  dien_thoai_cvht_ng2: { type: String },
  ma_truong: { type: String, required: true },
  ten_truong: { type: String, required: true },
  id_dia_phuong: { type: String, required: true },
  id_khoa: { type: String, required: true },
  id_sinh_vien: { type: String, required: true },
  id_lop: { type: String, required: true },
  id_khoi: { type: String, required: true },
  id_bac_he_nganh: { type: String, required: true },
  id_bac_he: { type: String, required: true },
  id_he: { type: String, required: true },
  id_quy_che: { type: String, required: true },
  id_quy_che_P: { type: String, required: true },
  id_hoc_che: { type: String, required: true },
  id_don_vi_phan_cap: { type: String, required: true },
  id_co_so_lop: { type: String, required: true },
  nhhk_vao: { type: Number, required: true },
  nhhk_ra: { type: Number, required: true },
  id_lop2: { type: String, required: true },
  id_khoi2: { type: String, required: true },
  id_bac_he_nganh2: { type: String, required: true },
  chuyen_nganh2: { type: String },
  is_master_pass: { type: Boolean, required: true },
  is_cvht_dang_nhap: { type: Boolean, required: true },
  is_phu_huynh_dang_nhap: { type: Boolean, required: true },
  int_hien_dien_sv: { type: Number, required: true },
  hien_dien_sv: { type: String, required: true },
  int_hien_dien_dkmh: { type: Number, required: true },
  ds_menu_cam_xem: { type: [String], required: true },
  str_hoan_thanh_dgrl: { type: String, required: true },
  str_dieu_kien_dk: { type: String, required: true },
  url_netweb: { type: String, required: true }
});

const SinhVien = mongoose.model<ISinhVien>('SinhVien', sinhVienSchema);

export default SinhVien;