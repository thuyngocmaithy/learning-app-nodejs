"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const sinhVienSchema = new mongoose_1.Schema({
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
const SinhVien = mongoose_1.default.model('SinhVien', sinhVienSchema);
exports.default = SinhVien;
