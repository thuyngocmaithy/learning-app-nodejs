import mongoose, { Schema, Document } from 'mongoose';

interface IDiemThanhPhan {
    ky_hieu: string;
    ten_thanh_phan: string;
    trong_so: string;
    diem_thanh_phan: string;
}

interface IDiem {
    ma_mon: string;
    ma_mon_tt: string;
    nhom_to: string;
    ten_mon: string;
    mon_hoc_nganh: boolean;
    so_tin_chi: string;
    diem_thi: string;
    diem_giua_ky: string;
    diem_tk: string;
    diem_tk_so: string;
    diem_tk_chu: string;
    ket_qua: number;
    hien_thi_ket_qua: boolean;
    loai_nganh: number;
    KhoaThi: number;
    khong_tinh_diem_tbtl: number;
    ly_do_khong_tinh_diem_tbtl: string;
    ds_diem_thanh_phan: IDiemThanhPhan[];
  }