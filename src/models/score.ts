import mongoose, { Schema, Document } from 'mongoose';

interface IDiemThanhPhan extends Document {
    ky_hieu: string;
    ten_thanh_phan: string;
    trong_so: string;
    diem_thanh_phan: string;
}

const diemThanhPhanSchema = new Schema({
    ky_hieu: { type: String, required: true },
    ten_thanh_phan: { type: String, required: true },
    trong_so: { type: String, required: true },
    diem_thanh_phan: { type: String, required: true }
});

const DiemThanhPhan = mongoose.model<IDiemThanhPhan>('DiemThanhPhan', diemThanhPhanSchema);

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

  const diemSchema = new Schema({
    ma_mon: { type : String, require : true, unique : true},
    ma_mon_tt : { type : String, require : true, unique : true},
    nhom_to : { type : String, require : true, unique : true},
    ten_mon : { type : String, require : true, unique : true},
    mon_hoc_nganh : { type : Boolean, require : true, unique : true},
    so_tin_chi : { type : String, require : true, unique : true},
    diem_thi : { type : String, require : true, unique : true},
    diem_giua_ki : { type : String, require : true, unique : true},
    diem_tk : { type : String, require : true, unique : true},
    diem_tk_so : { type : String, require : true, unique : true},
    diem_tk_chu :{ type : String, require : true, unique : true},
    ket_qua : { type : Number, require : true, unique : true},
    hien_thi_ket_qua : { type : Boolean, require : true, unique : true},
    loai_nganh : { type : Number, require : true, unique : true},
    KhoaThi : { type : Number, require : true, unique : true},
    khong_tinh_diem_tbtl : { type : Number, require : true, unique : true},
    ly_do_khong_tinh_diem_tbtl : { type : String, require : true, unique : true},
    ds_diem_thanh_phan: { type: [diemThanhPhanSchema], required: true }
    
  });
  
  const Diem = mongoose.model<IDiem>('Diem', diemSchema);
  
  export default Diem;