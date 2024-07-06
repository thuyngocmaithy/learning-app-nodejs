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
const diemThanhPhanSchema = new mongoose_1.Schema({
    ten_thanh_phan: { type: String, required: true },
    trong_so: { type: String, required: true },
    diem_thanh_phan: { type: String, required: true }
});
const DiemThanhPhan = mongoose_1.default.model('DiemThanhPhan', diemThanhPhanSchema);
const diemSchema = new mongoose_1.Schema({
    ma_mon: { type: String, require: true, unique: true },
    ten_mon: { type: String, require: true, unique: true },
    mon_hoc_nganh: { type: Boolean, require: true, unique: true },
    so_tin_chi: { type: String, require: true, unique: true },
    diem_thi: { type: String, require: true, unique: true },
    diem_giua_ki: { type: String, require: true, unique: true },
    diem_tk: { type: String, require: true, unique: true },
    diem_tk_so: { type: String, require: true, unique: true },
    diem_tk_chu: { type: String, require: true, unique: true },
    ket_qua: { type: Number, require: true, unique: true },
    hien_thi_ket_qua: { type: Boolean, require: true, unique: true },
    khong_tinh_diem_tbtl: { type: Number, require: true, unique: true },
    ly_do_khong_tinh_diem_tbtl: { type: String, require: true, unique: true },
    ds_diem_thanh_phan: { type: [diemThanhPhanSchema], required: true }
});
const Diem = mongoose_1.default.model('Diem', diemSchema);
exports.default = Diem;
