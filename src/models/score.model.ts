import mongoose, { Schema, Document } from 'mongoose';
import { ISubject } from './subject.model'; // Adjust the import path as needed

interface IDiemThanhPhan extends Document {
    ten_thanh_phan: string;
    trong_so: string;
    diem_thanh_phan: string;
} 

const diemThanhPhanSchema = new Schema<IDiemThanhPhan>({
    ten_thanh_phan: { type: String, required: true },
    trong_so: { type: String, required: true },
    diem_thanh_phan: { type: String, required: true }
});

const DiemThanhPhan = mongoose.model<IDiemThanhPhan>('DiemThanhPhan', diemThanhPhanSchema);

interface IDiem extends Document {
    idMonhoc: ISubject['_id']; // Reference to the ISubject id
    mon_hoc_nganh: boolean;
    diem_thi: string;
    diem_giua_ky: string;
    diem_tk: string;
    diem_tk_so: string;
    diem_tk_chu: string;
    ket_qua: number;
    hien_thi_ket_qua: boolean;
    khong_tinh_diem_tbtl: number;
    ly_do_khong_tinh_diem_tbtl: string;
    ds_diem_thanh_phan: IDiemThanhPhan[];
}

const diemSchema = new Schema<IDiem>({
    idMonhoc: { type: Schema.Types.ObjectId, ref: 'MonHoc', required: true },
    mon_hoc_nganh: { type: Boolean, required: true },
    diem_thi: { type: String, required: true },
    diem_giua_ky: { type: String, required: true },
    diem_tk: { type: String, required: true },
    diem_tk_so: { type: String, required: true },
    diem_tk_chu: { type: String, required: true },
    ket_qua: { type: Number, required: true },
    hien_thi_ket_qua: { type: Boolean, required: true },
    khong_tinh_diem_tbtl: { type: Number, required: true },
    ly_do_khong_tinh_diem_tbtl: { type: String, required: true },
    ds_diem_thanh_phan: [{ type: Schema.Types.ObjectId, ref: 'DiemThanhPhan' }]
});

const Diem = mongoose.model<IDiem>('Diem', diemSchema);

export default Diem;
export { IDiemThanhPhan, DiemThanhPhan };
